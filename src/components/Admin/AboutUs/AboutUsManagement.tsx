/**
 * AboutUsManagement - Edit the public About Us page
 *
 * Shows Vision, Mission and every team card exactly as the public page
 * renders them. Edits stay local until "Publish changes" writes the single
 * site_content/about_us document that /about-us reads.
 */

import { uuidv4 } from '@firebase/util';
import {
  faArrowLeft,
  faArrowRight,
  faPen,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { hasRoleLevel } from '../../../utils/adminPermissions';
import ImageUploadComponent from '../../shared/ImageUploadComponent';
import {
  type AboutPageContent,
  type SectionKey,
  type TeamMember,
  sectionTitles,
  toAboutPageContent,
  toLinkedinHandle
} from '../../WhoWeAre/aboutPageContent';
import Team from '../../WhoWeAre/Team';
import AdminButton from '../shared/AdminButton';
import LoadingSpinner from '../shared/LoadingSpinner';
import { PageSubtitle, PageTitle, SectionTitle } from '../shared/Typography';

const sections = Object.keys(sectionTitles) as SectionKey[];

const textFields: [keyof TeamMember, string][] = [
  ['name', 'Name'],
  ['pronouns', 'Pronouns'],
  ['role', 'Title / role'],
  ['affiliation', 'Affiliation (optional)'],
  ['linkedin', 'LinkedIn handle or profile URL (optional)']
];

const inputClass = 'mt-1 w-full rounded border border-gray-300 p-2 font-normal';

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
  originalSection: SectionKey | null;
  section: SectionKey;
}

const AboutUsManagement = () => {
  const { adminRole } = useAdminAuth();
  const { firebaseFirestore, firebaseStorage } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ error: boolean; text: string }>();

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

  const update = (next: AboutPageContent) => {
    setContent(next);
    setDirty(true);
    setStatus(undefined);
  };

  const setTeam = (section: SectionKey, members: TeamMember[]) =>
    update({ ...content, team: { ...content.team, [section]: members } });

  const moveMember = (section: SectionKey, index: number, delta: number) => {
    const members = [...content.team[section]];
    members.splice(index + delta, 0, ...members.splice(index, 1));
    setTeam(section, members);
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
    const team = { ...content.team };

    if (originalSection === section) {
      team[section] = team[section].map((m) =>
        m.id === member.id ? member : m
      );
    } else {
      if (originalSection) {
        team[originalSection] = team[originalSection].filter(
          (m) => m.id !== member.id
        );
      }
      team[section] = [...team[section], member];
    }

    update({ ...content, team });
    setEditing(null);
  };

  // Built-in photos are bundled site assets whose URLs differ per deployment;
  // copy them to Storage on publish so every site renders the same URL.
  const toStorageUrl = async (src: string | null) => {
    if (!src || /^https?:\/\//.test(src)) return src;
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
      const team = { ...content.team };
      for (const section of sections) {
        team[section] = await Promise.all(
          team[section].map(async (m) => ({
            ...m,
            image: await toStorageUrl(m.image)
          }))
        );
      }
      const next = { ...content, team };

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
            Cards look exactly as they do on the public page. Nothing goes live
            until you publish.
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

      {sections.map((section) => (
        <section className="mb-10" key={section}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <SectionTitle>{sectionTitles[section]}</SectionTitle>
            <AdminButton
              icon={faPlus}
              onClick={() =>
                setEditing({
                  member: blankMember(),
                  originalSection: null,
                  section
                })
              }
              size="small"
              text="Add person"
              variant="secondary"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            {content.team[section].map((member, index) => (
              <div key={member.id}>
                <Team {...member} />
                <div className="flex flex-wrap gap-2">
                  <AdminButton
                    icon={faPen}
                    onClick={() =>
                      setEditing({ member, originalSection: section, section })
                    }
                    size="small"
                    text="Edit"
                  />
                  <AdminButton
                    disabled={index === 0}
                    icon={faArrowLeft}
                    onClick={() => moveMember(section, index, -1)}
                    size="small"
                    text="Earlier"
                    variant="ghost"
                  />
                  <AdminButton
                    disabled={index === content.team[section].length - 1}
                    icon={faArrowRight}
                    onClick={() => moveMember(section, index, 1)}
                    size="small"
                    text="Later"
                    variant="ghost"
                  />
                  <AdminButton
                    icon={faTrash}
                    onClick={() =>
                      setTeam(
                        section,
                        content.team[section].filter((m) => m.id !== member.id)
                      )
                    }
                    size="small"
                    text="Remove"
                    variant="danger"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

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
                        setEditing({
                          ...editing,
                          section: e.target.value as SectionKey
                        })
                      }
                      value={editing.section}
                    >
                      {sections.map((s) => (
                        <option key={s} value={s}>
                          {sectionTitles[s]}
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
                    onUploadStateChange={setUploading}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <AdminButton
                onClick={() => setEditing(null)}
                text="Cancel"
                variant="secondary"
              />
              <AdminButton
                disabled={!editing.member.name.trim() || uploading}
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
