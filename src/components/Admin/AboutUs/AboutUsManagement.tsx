/**
 * AboutUsManagement - Edit the public About Us page
 *
 * Shows Vision, Mission and every team section and card as the public page
 * renders them. Drag cards and sections to reorder them (the arrow buttons do
 * the same from the keyboard). Edits stay local until "Publish changes"
 * writes the single site_content/about_us document that /about-us reads.
 */

import { uuidv4 } from '../../../utils/uuid';
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faEye,
  faEyeSlash,
  faGripVertical,
  faPen,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Masonry from 'react-masonry-css';
import { Navigate } from 'react-router-dom';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { colors, fonts } from '../../../theme/styleVars';
import { hasRoleLevel } from '../../../utils/adminPermissions';
import ImageUploadComponent from '../../shared/ImageUploadComponent';
import {
  type AboutPageContent,
  type TeamMember,
  type TeamSection,
  toAboutPageContent,
  toLinkedinHandle
} from '../../WhoWeAre/aboutPageContent';
import Team from '../../WhoWeAre/Team';
import AdminButton from '../shared/AdminButton';
import LoadingSpinner from '../shared/LoadingSpinner';
import { PageSubtitle, PageTitle, SectionTitle } from '../shared/Typography';

const textFields: [keyof TeamMember, string][] = [
  ['name', 'Name'],
  ['pronouns', 'Pronouns'],
  ['role', 'Title / role'],
  ['affiliation', 'Affiliation (optional)'],
  ['linkedin', 'LinkedIn handle or profile URL (optional)']
];

const inputClass = 'mt-1 w-full rounded border border-gray-300 p-2 font-normal';

// Same columns as the public page (layout/Collapsible).
const masonryColumns = { default: 3, 1100: 2, 700: 2, 500: 1 };

const blankMember = (): TeamMember => ({
  affiliation: null,
  bio: '',
  id: uuidv4(),
  image: null,
  linkedin: null,
  name: '',
  pronouns: '',
  role: ''
});

interface Editing {
  member: TeamMember;
  originalSection: string | null;
  section: string;
}

interface Drag {
  id: string;
  kind: 'member' | 'section';
}

const AboutUsManagement = () => {
  const { adminRole } = useAdminAuth();
  const { firebaseFirestore, firebaseStorage } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [photoPending, setPhotoPending] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ error: boolean; text: string }>();
  const [drag, setDrag] = useState<Drag | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    getDoc(doc(firebaseFirestore, 'site_content', 'about_us'))
      .then((snapshot) => setContent(toAboutPageContent(snapshot.data())))
      .catch((error) => {
        // No editor without the live copy: publishing over it would lose edits.
        console.error('Failed to load About Us content', error);
        setLoadFailed(true);
      });
  }, [firebaseFirestore]);

  if (!hasRoleLevel(adminRole, 'admin')) {
    return <Navigate to="/admin" replace />;
  }

  if (loadFailed) {
    return (
      <p role="alert">
        Could not load the About Us page content. Refresh to try again.
      </p>
    );
  }

  if (!content) {
    return <LoadingSpinner />;
  }

  const { sections } = content;

  const update = (next: AboutPageContent) => {
    setContent(next);
    setDirty(true);
    setStatus(undefined);
    setConfirmRemove(null);
  };

  const setSections = (next: TeamSection[]) =>
    update({ ...content, sections: next });

  const setSection = (id: string, changes: Partial<TeamSection>) =>
    setSections(sections.map((s) => (s.id === id ? { ...s, ...changes } : s)));

  // Moving down lands after the target, moving up lands before it.
  const moveSection = (id: string, toId: string) => {
    const next = [...sections];
    const to = next.findIndex((s) => s.id === toId);
    next.splice(
      to,
      0,
      ...next.splice(
        next.findIndex((s) => s.id === id),
        1
      )
    );
    setSections(next);
  };

  // Same rule within a section; into another section it lands before the
  // target card, or at the end when there is none.
  const moveMember = (id: string, toSection: string, toId: string | null) => {
    const next = sections.map((s) => ({ ...s, members: [...s.members] }));
    const from = next.find((s) => s.members.some((m) => m.id === id));
    const to = next.find((s) => s.id === toSection);
    if (!from || !to) return;
    const toIndex = toId
      ? to.members.findIndex((m) => m.id === toId)
      : to.members.length;
    const [member] = from.members.splice(
      from.members.findIndex((m) => m.id === id),
      1
    );
    to.members.splice(toIndex, 0, member);
    setSections(next);
  };

  const endDrag = () => {
    setDrag(null);
    setDropTarget(null);
  };

  const startDrag = (e: React.DragEvent, next: Drag) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', next.id); // Firefox needs data to drag
    setDrag(next);
  };

  // A drop on a card goes before that card; a drop anywhere else in the
  // section goes to its end. Sections dropped anywhere in a section move there.
  const dropProps = (sectionId: string, memberId: string | null) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!drag) return;
      e.preventDefault();
      e.stopPropagation();
      setDropTarget(drag.kind === 'member' && memberId ? memberId : sectionId);
    },
    onDrop: (e: React.DragEvent) => {
      if (!drag) return;
      e.preventDefault();
      e.stopPropagation();
      if (drag.kind === 'section') {
        if (drag.id !== sectionId) moveSection(drag.id, sectionId);
      } else if (drag.id !== memberId) {
        moveMember(drag.id, sectionId, memberId);
      }
      endDrag();
    }
  });

  const removeSection = (section: TeamSection) => {
    if (section.members.length && confirmRemove !== section.id) {
      setConfirmRemove(section.id);
      return;
    }
    setSections(sections.filter((s) => s.id !== section.id));
  };

  const setMember = (changes: Partial<TeamMember>) =>
    setEditing(
      (current) =>
        current && { ...current, member: { ...current.member, ...changes } }
    );

  const saveMember = () => {
    if (!editing) return;
    const { originalSection, section } = editing;
    const member: TeamMember = {
      ...editing.member,
      affiliation: editing.member.affiliation?.trim() || null,
      linkedin: toLinkedinHandle(editing.member.linkedin),
      name: editing.member.name.trim()
    };

    setSections(
      sections.map((s) => {
        if (originalSection === section) {
          return s.id === section
            ? {
                ...s,
                members: s.members.map((m) => (m.id === member.id ? member : m))
              }
            : s;
        }
        const members = s.members.filter((m) => m.id !== member.id);
        return {
          ...s,
          members: s.id === section ? [...members, member] : members
        };
      })
    );
    setEditing(null);
  };

  // Built-in photos are bundled site assets (same origin as this page; Vite
  // makes their URLs absolute, Next leaves them relative). Copy them to
  // Storage on publish so every deployment renders the same URL.
  const toStorageUrl = async (src: string | null) => {
    const { origin } = window.location;
    if (!src || new URL(src, origin).origin !== origin) return src;
    const response = await fetch(src);
    if (!response.ok) throw new Error(`Could not copy photo ${src}`);
    const fileRef = ref(firebaseStorage, `images/about-us/${uuidv4()}`);
    await uploadBytes(fileRef, await response.blob());
    return getDownloadURL(fileRef);
  };

  const publish = async () => {
    setPublishing(true);
    setStatus(undefined);

    try {
      const published: TeamSection[] = [];
      for (const section of sections) {
        published.push({
          ...section,
          members: await Promise.all(
            section.members.map(async (m) => ({
              ...m,
              image: await toStorageUrl(m.image)
            }))
          )
        });
      }
      const next = { ...content, sections: published };

      await setDoc(doc(firebaseFirestore, 'site_content', 'about_us'), {
        ...next,
        updated_at: serverTimestamp(),
        updated_by: currentUser?.uid ?? null
      });
      setContent(next);
      setDirty(false);
      setStatus({
        error: false,
        text: 'Published. The public About Us page updates within a minute.'
      });
    } catch (error) {
      console.error('Failed to publish About Us content', error);
      setStatus({
        error: true,
        text: 'Publish failed. Your changes are still here; try again.'
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <PageTitle>About Us</PageTitle>
          <PageSubtitle>
            Sections and cards look as they do on the public page. Drag them to
            reorder. Nothing goes live until you publish.
          </PageSubtitle>
        </div>
        <AdminButton
          disabled={!dirty}
          loading={publishing}
          onClick={publish}
          text={dirty ? 'Publish changes' : 'All changes published'}
        />
      </div>

      {status && (
        <p
          className={status.error ? 'text-red-700' : 'text-green-700'}
          role="status"
        >
          {status.text}
        </p>
      )}

      <div className="mb-10 grid gap-6 md:grid-cols-2">
        {(['vision', 'mission'] as const).map((field) => (
          <label className="block" key={field}>
            <SectionTitle as="span">
              {field === 'vision' ? 'Vision' : 'Mission'}
            </SectionTitle>
            <textarea
              className={inputClass}
              onChange={(e) => update({ ...content, [field]: e.target.value })}
              rows={4}
              value={content[field]}
            />
          </label>
        ))}
      </div>

      {sections.map((section, sectionIndex) => (
        <section
          aria-label={section.title || 'Untitled section'}
          className={`mb-10 rounded p-2 ${
            dropTarget === section.id ? 'ring-2 ring-[#82B29A]' : ''
          }`}
          key={section.id}
          {...dropProps(section.id, null)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-gray-400 cursor-grab px-1"
              draggable
              onDragEnd={endDrag}
              onDragStart={(e) => {
                const card = e.currentTarget.closest('section');
                if (card) e.dataTransfer.setDragImage(card, 0, 0);
                startDrag(e, { id: section.id, kind: 'section' });
              }}
              title="Drag to reorder sections"
            >
              <FontAwesomeIcon icon={faGripVertical} />
            </span>
            <input
              aria-label="Section title"
              className={`hover:border-gray-300 focus:border-gray-400 min-w-[12rem] flex-1 border-0 border-b-2 border-dashed border-transparent bg-transparent p-0 text-[21px] font-bold focus:outline-none ${
                section.hidden ? 'opacity-50' : ''
              }`}
              onChange={(e) =>
                setSection(section.id, { title: e.target.value })
              }
              placeholder="Section title"
              style={{ color: colors.mainFont, fontFamily: fonts.montserrat }}
              value={section.title}
            />
            {section.hidden && (
              <span className="bg-gray-200 rounded px-2 py-1 text-xs font-semibold">
                Hidden on the public page
              </span>
            )}
            <AdminButton
              disabled={sectionIndex === 0}
              icon={faArrowUp}
              onClick={() =>
                moveSection(section.id, sections[sectionIndex - 1].id)
              }
              size="small"
              text="Up"
              variant="ghost"
            />
            <AdminButton
              disabled={sectionIndex === sections.length - 1}
              icon={faArrowDown}
              onClick={() =>
                moveSection(section.id, sections[sectionIndex + 1].id)
              }
              size="small"
              text="Down"
              variant="ghost"
            />
            <AdminButton
              icon={section.hidden ? faEye : faEyeSlash}
              onClick={() =>
                setSection(section.id, { hidden: !section.hidden })
              }
              size="small"
              text={section.hidden ? 'Show' : 'Hide'}
              variant="ghost"
            />
            <AdminButton
              icon={faTrash}
              onClick={() => removeSection(section)}
              size="small"
              text={
                confirmRemove === section.id
                  ? `Remove section and ${section.members.length} ${
                      section.members.length === 1 ? 'person' : 'people'
                    }`
                  : 'Remove section'
              }
              variant="danger"
            />
            <AdminButton
              icon={faPlus}
              onClick={() =>
                setEditing({
                  member: blankMember(),
                  originalSection: null,
                  section: section.id
                })
              }
              size="small"
              text="Add person"
              variant="secondary"
            />
          </div>
          <hr
            className="my-3 border-2 opacity-100"
            style={{ borderColor: colors.salmon }}
          />
          <div className={section.hidden ? 'opacity-50' : ''}>
            {section.members.length === 0 && (
              <p className="text-gray-500 py-6 text-center">
                No one here yet. Add a person or drag a card into this section.
              </p>
            )}
            <Masonry
              breakpointCols={masonryColumns}
              className="-ml-[30px] flex w-auto"
              columnClassName="bg-clip-padding pl-[30px]"
            >
              {section.members.map((member, index) => (
                <div
                  className={`mb-[30px] cursor-grab rounded ${
                    dropTarget === member.id ? 'ring-2 ring-[#82B29A]' : ''
                  } ${drag?.id === member.id ? 'opacity-40' : ''}`}
                  draggable
                  key={member.id}
                  onDragEnd={endDrag}
                  onDragStart={(e) =>
                    startDrag(e, { id: member.id, kind: 'member' })
                  }
                  {...dropProps(section.id, member.id)}
                >
                  <Team {...member} />
                  <div className="flex flex-wrap gap-2">
                    <AdminButton
                      icon={faPen}
                      onClick={() =>
                        setEditing({
                          member,
                          originalSection: section.id,
                          section: section.id
                        })
                      }
                      size="small"
                      text="Edit"
                    />
                    <AdminButton
                      disabled={index === 0}
                      icon={faArrowLeft}
                      onClick={() =>
                        moveMember(
                          member.id,
                          section.id,
                          section.members[index - 1].id
                        )
                      }
                      size="small"
                      text="Earlier"
                      variant="ghost"
                    />
                    <AdminButton
                      disabled={index === section.members.length - 1}
                      icon={faArrowRight}
                      onClick={() =>
                        moveMember(
                          member.id,
                          section.id,
                          section.members[index + 1].id
                        )
                      }
                      size="small"
                      text="Later"
                      variant="ghost"
                    />
                    <AdminButton
                      icon={faTrash}
                      onClick={() =>
                        setSection(section.id, {
                          members: section.members.filter(
                            (m) => m.id !== member.id
                          )
                        })
                      }
                      size="small"
                      text="Remove"
                      variant="danger"
                    />
                  </div>
                </div>
              ))}
            </Masonry>
          </div>
        </section>
      ))}

      <AdminButton
        icon={faPlus}
        onClick={() =>
          setSections([
            ...sections,
            { hidden: false, id: uuidv4(), members: [], title: 'NEW SECTION' }
          ])
        }
        text="Add section"
        variant="secondary"
      />

      <Modal
        backdrop="static"
        onHide={() => setEditing(null)}
        show={!!editing}
        size="xl"
      >
        {editing && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                {editing.originalSection ? 'Edit' : 'Add'} team member
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="grid gap-3">
                  {textFields.map(([key, label]) => (
                    <label className="block text-sm font-semibold" key={key}>
                      {label}
                      <input
                        className={inputClass}
                        onChange={(e) => setMember({ [key]: e.target.value })}
                        value={(editing.member[key] as string | null) ?? ''}
                      />
                    </label>
                  ))}
                  <label className="block text-sm font-semibold">
                    Section
                    <select
                      className={inputClass}
                      onChange={(e) =>
                        setEditing({ ...editing, section: e.target.value })
                      }
                      value={editing.section}
                    >
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title || 'Untitled section'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Bio (leave a blank line between paragraphs)
                    <textarea
                      className={inputClass}
                      onChange={(e) => setMember({ bio: e.target.value })}
                      rows={10}
                      value={editing.member.bio}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Preview (click View Bio to check the bio)
                  </p>
                  <Team {...editing.member} />
                  <p className="mt-4 text-sm font-semibold">Photo</p>
                  <ImageUploadComponent
                    currentImageUrl={editing.member.image ?? undefined}
                    helperText="Square photos work best. Max 5MB."
                    imageType="company"
                    onSave={(url) => setMember({ image: url })}
                    onPendingChange={setPhotoPending}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              {photoPending && (
                <p className="mb-0 mr-auto text-sm" role="status">
                  Click Upload File to finish adding the photo.
                </p>
              )}
              <AdminButton
                onClick={() => setEditing(null)}
                text="Cancel"
                variant="secondary"
              />
              <AdminButton
                disabled={!editing.member.name.trim() || photoPending}
                onClick={saveMember}
                text="Done"
              />
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AboutUsManagement;
