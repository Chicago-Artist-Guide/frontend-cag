// Board of Directors
import Adler from '../../images/who-we-are/board/Board_Adler.jpg';
import Cooper from '../../images/who-we-are/board/Board_Cooper.png';
import Dolezalek from '../../images/who-we-are/board/Board_Dolezalek.png';
import Frazier from '../../images/who-we-are/board/Board_Frazier.png';
import GomezBeloz from '../../images/who-we-are/board/Board_Gomez-Beloz.jpg';
import Goins from '../../images/who-we-are/board/Board_Goins.jpg';
import Laws from '../../images/who-we-are/board/Board_Laws.jpg';
import McCall from '../../images/who-we-are/board/Board_McCall.jpg';

// Artist Auxiliary Board
import Ferro from '../../images/who-we-are/board/Board_Ferro.png';
import Kauffman from '../../images/who-we-are/board/Board_Kauffman.png';
import Mangren from '../../images/who-we-are/board/Board_Mangren.jpg';
import Kester from '../../images/who-we-are/board/Board_Kester.png';
import Tayler from '../../images/who-we-are/board/Board_Tayler.jpg';
import Carter from '../../images/who-we-are/board/Board_Carter.jpg';
import Johnson from '../../images/who-we-are/board/Board_Johnson.jpg';
import Mason from '../../images/who-we-are/board/Board_Mason.jpg';
import Russell from '../../images/who-we-are/board/Board_Russell.jpg';
import Spielman from '../../images/who-we-are/board/Board_Spielman.jpg';
import Uyao from '../../images/who-we-are/board/Board_Uyao.jpg';
import Moorman from '../../images/who-we-are/operations/Staff_Moorman.png';

// Business Operations
import Schutz from '../../images/who-we-are/board/Board_Schutz.png';
import Adamy from '../../images/who-we-are/operations/Staff_Adamy.png';
import Newsome from '../../images/who-we-are/operations/Staff_Newsome.png';
import Walton from '../../images/who-we-are/operations/Staff_Walton.png';
import Cadenhead from '../../images/who-we-are/board/Board_Cadenhead.png';
import Benda from '../../images/who-we-are/operations/Staff_Benda.jpg';
import Ledesma from '../../images/who-we-are/operations/Staff_Ledesma.png';
import Meyers from '../../images/who-we-are/operations/Staff_Meyers.jpg';

// Site Development
import MendezGonzalez from '../../images/who-we-are/board/Board_Mendez_Gonzalez.jpg';
import Fischer from '../../images/who-we-are/technical/Staff_Fischer.jpg';
import JewellAlex from '../../images/who-we-are/technical/Staff_Jewell.jpg';
import Knuteson from '../../images/who-we-are/technical/Staff_Knuteson.jpg';
import Goldstein from '../../images/who-we-are/technical/Staff_Goldstein.png';
import Glendinning from '../../images/who-we-are/technical/Staff_Glendinning.jpg';

// Advisory Board
import Silva from '../../images/who-we-are/board/Board_Silva.jpg';
import Steinrock from '../../images/who-we-are/board/Board_Steinrock.jpg';
import JewellJordin from '../../images/who-we-are/operations/Staff_Jewell.jpg';

const bioId = () => (<any>crypto).randomUUID();

const bios = {
  board: [
    {
      id: bioId(),
      name: 'Jorie Goins',
      role: 'President',
      pronouns: 'she/her',
      affiliation: 'Communications Director, American Heart Association',
      image: Goins,
      linkedin: 'joriejgoins',
      bio: "is a dancer based out of Chicago, Ill. Jorie earned a bachelor's degree in journalism with a minor in dance from Northwestern University in 2016. While at Northwestern, Jorie was a member of Tonik Tap, Northwestern's premiere tap dance company where she choreographed five original pieces. Jorie has danced with Noumenon Dance Ensemble, Praize Productions' Rize Pro-Elite company, and as a guest performer with Chicago Tap Theatre. She has performed works choreographed by Brenda Bufalino, Rich Ashworth, Mark Yonally, Nicole Clarke Springer and April Torneby."
    },
    {
      id: bioId(),
      name: 'Zeke Dolezalek',
      role: 'Vice President',
      pronouns: 'he/him',
      affiliation:
        'Human Resources & Recruitment Manager, Corner Table Restaurants',
      image: Dolezalek,
      linkedin: 'iamzeked',
      bio: 'In the workplace or in the community, Zeke has a passion for creating spaces in which people can thrive. As a People & Culture leader with a background in restaurant hospitality and multi-state operations, Zeke has led large-scale team growth, new location openings, and people-first initiatives across high-volume, fast-moving brands. His work centers on translating real-world people challenges into clear, scalable practices that support both frontline teams and leadership.\n\nOutside of his HR work, Zeke is deeply connected to the arts. He holds a BFA in Musical Theatre from the Chicago College of Performing Arts and has remained actively involved in the theatre community as a performer, educator, and advocate. As a professional photographer, Zeke specializes in headshots, events, and production photography, with a focus on capturing artists authentically. @iAmZekeD'
    },
    {
      id: bioId(),
      name: 'Dr. Tracy Cooper',
      role: 'Secretary',
      pronouns: 'she/her',
      affiliation:
        'Licensed Clinical Social Worker, neurobehavioral practitioner, and trauma specialist',
      image: Cooper,
      linkedin: 'dr-tracy-cooper-196a54',
      bio: 'Dr. Tracy Cooper is a Doctor of Clinical Social Work, Licensed Clinical Social Worker, neurobehavioral practitioner, and trauma specialist with 24 years of experience in the field. She has provided direct clinical care and consultation services for infants, children, youth, families, and individuals with mental health needs, developmental and neurobehavioral disabilities, trauma, and medical care continuity challenges. As an entrepreneur, Dr. Cooper founded and evolved her solo mental health practice into a fully incorporated mental health agency, where she currently serves as CEO and owner. She is deeply committed to advancing access to services for underserved populations and actively contributes to local and state policy initiatives aimed at addressing systemic barriers within the healthcare and social services sectors. Dr. Cooper is also a 35-year member of Zeta Phi Beta Sorority, Inc., where she has held numerous elected and appointed leadership positions at the local, regional, and international levels, promoting service, advocacy, and sustainable community change. For Dr. Tracy Cooper, this work is more than a career—it is a lifelong journey of purpose. Every step she takes is fueled by her unwavering belief that everyone deserves the opportunity to heal, grow, and reach their full potential.'
    },
    {
      id: bioId(),
      name: 'Emily Adler',
      role: 'Treasurer',
      pronouns: 'she/her',
      affiliation: 'Dining Services Director, Montclair Senior Living',
      image: Adler,
      linkedin: 'emily-adler-8830659',
      bio: 'is a Chicago-area chef and hospitality jill-of-all trades. After years in high end, fast paced hotels and catering, Emily moved on to running a 15 room bed and breakfast with a 50 seat restaurant in upstate New York. Upon her return to Chicago, Emily focused on raising the standard of dining in the elder care sector. Five years of managing cheese shops and grocery stores rounds out her resume. She currently is the Dining Services Director at Montclair Senior Living. She enjoys catering small dinners with curated beverage pairings, working in her organic vegetable garden and supporting various non-profit organizations.'
    },
    {
      id: bioId(),
      name: 'Cheryl Frazier',
      role: 'Board Member',
      pronouns: 'she/her',
      affiliation:
        'Director of Test Adjudication, Southland College Prep Charter HS',
      image: Frazier,
      linkedin: 'cheryl-frazier-28938154',
      bio: 'hails from the Chicago south suburb of Markham, Illinois.  Her love for theatre was nurtured by competing in speech and drama at Thornwood High School. Cheryl Frazier is a nationally recognized forensics educator, who has served as Director of Forensics and Theatre at Southland College Prep Charter since 2011. Frazier started her teaching career at South Holland (Illinois) Thornwood High School in 1997 as a speech and science teacher and held various extracurricular positions, including theatre manager, head speech coach, and assistant play director. She additionally served Thornwood as the Fine Arts Department Chair and Arts and Communication House Leader before becoming the Fine Arts Area Instructional Leader for District 205. As the group interpretation director at both Thornwood and Southland College Prep, she was a seven-time state champion, five-time state runner up and six-time finalist director. Additionally, under Frazier’s direction numerous students have won Illinois High School Association (IHSA) regional, sectional, and state titles and National Speech and Debate Association national speech titles. Frazier was named the 2018-19 Outstanding Debate and Theatre Educator for the National Federation of High School’s (NFHS) central section of Illinois, Indiana, Iowa, Michigan, and Wisconsin and is a 2020 recipient of the NFHS Citation award. As she moves from directing and coaching to acting, the role of Lena “Mama” Younger remains her favorite, playing it three times since 2014. Frazier is a graduate of Drake University and also earned a master’s degree in Communications Studies from Governors State University, as well. Frazier believes in the power of the spoken word and the impact BIPOC artists have in using their gifts to heal a community.'
    },
    {
      id: bioId(),
      name: 'Selina Gomez-Beloz',
      role: 'Board Member',
      pronouns: 'she/her',
      affiliation: 'CEO, Madrina Consulting',
      image: GomezBeloz,
      linkedin: 'sgomezbeloz',
      bio: "is a native of NW Indiana but has lived and worked across the country, and for a short time in South America, with her husband. She is also the CEO/Business Madrina of Madrina Consulting, a firm that works with nonprofit leaders and advocates in creating successful organizations, especially those led by women of color. Selina holds a Master of Library Science from the University of Illinois Urbana-Champaign and a Master of Nonprofit Management from DePaul University. Selina's creative outlets are primarily in fiber arts and cooking, but she deeply appreciates the theatre arts."
    },
    {
      id: bioId(),
      name: 'Lisa Laws',
      role: 'Board Member',
      pronouns: 'she/her',
      affiliation: 'Jacobs, VP of Chicago Operations & Market Growth',
      image: Laws,
      linkedin: 'lisalaws',
      bio: "is a visionary leader committed to fostering growth and opportunity within the arts community. Born and raised in Hyde Park, Chicago, Lisa has deep roots in the city and a strong connection to its vibrant cultural landscape. With over 15 years of executive experience, Lisa serves as VP of Chicago Operations & Market Growth at Jacobs.\n\nBeyond her professional endeavors, Lisa is deeply passionate about supporting artists and cultural initiatives. Her commitment to social value is evident in her pivotal roles at Mayor Rahm Emanuel's Office and the Department of Cultural Affairs and Special Events (DCASE). In these positions, she led daily operations, coordinated significant events, and managed comprehensive infrastructure projects, demonstrating resilience and strategic insight in addressing the diverse needs of Chicago's vibrant arts community.\n\nLisa's academic achievements include an MBA from Northwestern's Kellogg School of Management, a Graduate Certificate in Infrastructure Engineering and Management from the Illinois Institute of Technology, and dual degrees from Tulane and Xavier University of Louisiana. Recognized for her contributions to STEM education, innovation, and diversity, Lisa is dedicated to advancing opportunities for artists and cultural organizations.\n\nAs a member of the Board of Directors for the Chicago Artist Guide, Lisa is poised to make a lasting impact, leveraging her expertise to support and elevate the vibrant arts community in Chicago and beyond. Lisa's passion for music and performance is evident in her involvement in the Kenwood Academy Concert Choir and the Chicago Children's Choir, now Uniting Voices Chicago, where she had the opportunity to tour extensively across the US and the globe."
    },
    {
      id: bioId(),
      name: 'Joey M. McCall, Esq.',
      role: 'Past President & Board Consult',
      pronouns: 'he/him',
      affiliation:
        'Founder & Managing Partner, McCall | Atten; Founder & Chief Vision Officer, Law Lynx',
      image: McCall,
      linkedin: 'joey-m-mccall-esq-303356143',
      bio: 'is the founding Principal and Managing Partner of McCall | Atten, International, PLLC. He is the Founder and Chief Vision Officer of Law Lynx, Inc. Law Lynx, Inc., is a legal technology company committed to creating accessible legal technology and facilitating on-demand legal help when it is needed most. With an eye on the ever-evolving future, Mr. McCall has positioned himself as a thought leader, driving key conversations through speaking engagements at a variety of educational institutions, professional organizations, and companies. In his spare time, Mr. McCall mentors high school students in the areas of STEM, law, and entrepreneurship. Mr. McCall also sits on the boards of several philanthropic causes and charities. Mr. McCall has been repeatedly recognized as a SUPER LAWYERS Rising Star, and he was recognized as one of the National Black Lawyers Association\'s "Top 40 under 40" in 2021. Mr.McCall has been recognized as "Martindale Hubbell Preeminent", a rating based upon peer review, which is only awarded to attorneys with the highest ethical standards, skills, and reputation. Mr. McCall advocates for the voiceless and disenfranchised no matter what situation or walk of life they are in. His chief goal is to drive change in a diverse variety of industries and communities.'
    }
  ],
  artists: [
    {
      id: bioId(),
      name: 'Van Ferro',
      role: 'President',
      pronouns: 'he/him',
      affiliation: null,
      image: Ferro,
      linkedin: 'vanferro',
      bio: 'is honored to be part of the Artist Auxiliary Board at Chicago Artist Guide. He is a professional stage and screen actor in Chicago, IL who is passionate with finding ways to help make Chicago theater more diverse, as well as to support new work in theater. Recent selected theater collaboration with Oil Lamp Theater, Sigman Brothers, Three Cat Productions, and Act Your Page. Van also won two BroadwayWorld Chicago Awards for performance in 2021. @therealvanferro'
    },
    {
      id: bioId(),
      name: 'Ema Kester',
      role: 'Vice President',
      pronouns: 'they/she',
      affiliation: null,
      image: Kester,
      linkedin: 'ema-kester',
      bio: "is a Chicago-based actor, director, stage manager, and dramaturg dedicated to inclusive, equity-driven storytelling. A Loyola University Chicago alum, their recent credits include production managing Rivendell Theatre Ensemble's Fresh Produce Festival, and stage managing Artemisia Theatre's We Women Play Festival, where they also read stage directions for both projects. Other credits include Everybody (Loyola University Chicago, ETA Creative Arts) and Forest of Sin (The First Pescatarian Church), and countless student-led productions during their time at Loyola. Ema brings authenticity and collaboration to every role, both on and off the stage, fostering dialogue and change within Chicago's arts community."
    },
    {
      id: bioId(),
      name: 'Jasanna Tayler',
      role: 'Secretary/Treasurer',
      pronouns: 'she/her',
      affiliation: null,
      image: Tayler,
      linkedin: 'jasanna-tayler',
      bio: "soprano (M.M., North Park University; B.M., B.B.A., Western Michigan University), is a versatile performer from West Michigan, based in Chicago, recognized for her expressive singing and collaborative energy. She has toured nationally and internationally with North Park's Chamber Singers, performed at Chicago Bach Week, and appeared in roles including Anna Akhmatova (Murder on the Titanic) and Jan the Famished (Yeast Nation), among others.\n\nJasanna looks forward to supporting Chicago Artist Guide's mission to diversify theatre. As an opera singer, she is committed to amplifying underrepresented voices and is excited to contribute her experience and values to the Artist Board."
    },
    {
      id: bioId(),
      name: 'Gianna Carter',
      role: 'Artist Board Member',
      pronouns: 'she/her',
      affiliation: null,
      image: Carter,
      linkedin: 'gianna-carter-305623389',
      bio: "is an arts administrator, educator, and production leader committed to expanding access to the arts.  She holds a BFA in Theatre Management from Auburn University, with training in stage management, events management, and technical theatre. \n\nGianna's professional experience spans higher education, professional theatre, and large-scale event and program operations. She currently serves as Production Coordinator at Northwestern University's Wirtz Center for the Performing Arts, where she oversees complex performance operations across multiple venues, supervises and mentors student employees, and collaborates with faculty, guest artists, and campus partners to bring ambitious artistic work to life. She takes pride in building organized, supportive environments where emerging artists and technicians feel prepared, valued, and empowered to grow. Previously, Gianna worked as Associate Production Manager at Florida Repertory Theatre, supporting the full production lifecycle through budget oversight, contract coordination, scheduling, and partnership management. Across roles, she has developed a strong foundation in systems-building, cross-functional collaboration, and operational leadership—bridging artistic vision with sustainability, equity, and care. \n\nHer work is grounded in a deep belief in education as a pathway to access and equity, and she remains passionate about building programs, processes, and spaces that reflect and serve diverse communities."
    },
    {
      id: bioId(),
      name: 'Josh Johnson',
      role: 'Artist Board Member',
      pronouns: 'he/him',
      affiliation: null,
      image: Johnson,
      linkedin: 'joshua-johnson-chicago',
      bio: "is a freelance director and producer with years of experience in the Chicago theatre community. Throughout his career he's worked in a range of styles including the exploration and development of new and traditional works in non-traditional ways, collaborating with various theatre companies including Red Theater, Stage Left Theatre and Oil Lamp Theater, among others. He previously served as Managing Director and Board Treasurer with Red Tape Theatre during which time they joined Steppenwolf Theatre's Garage Rep Series with their production of The Walk Across America for Mother Earth by Taylor Mac.\n\nJoshua holds a BFA in performance from the University of Wisconsin-Steves Point and an MA in Creative Performance Practice from London South Bank University, in collaboration with the Lyric Hammersmith Theatre. He has been a member of the Joseph Jefferson Award Committee's Artistic & Technical Team since 2010 and is currently a volunteer Programme Assistant with the Sunderland Shorts Film Festival in the UK."
    },
    {
      id: bioId(),
      name: 'Madison Kauffman',
      role: 'Artist Board Member',
      pronouns: 'she/her',
      affiliation: null,
      image: Kauffman,
      linkedin: 'madisonkauffman13',
      bio: 'Madison is over the moon to be working with Chicago Artist Guide. She is a professional actress for both the stage and screen- working here in Chicago as well as regionally. Credits include: Chicago Shakespeare Theater, Lyric Opera of Chicago, Paramount Theatre, Broadway in Chicago, Theo Ubique, Kokandy Productions, Drury Lane Oakbrook, NYMF, & Casa Manana. When not performing, she loves to create and find art in everything she does. Madison also works as a freelance social media content creator and on her downtime, loves playing the accordion or baking. She holds a BFA in Musical Theater and Digital Media Marketing from Millikin University and is proudly represented by Gray Talent Group.'
    },
    {
      id: bioId(),
      name: 'Izzy Mangren',
      role: 'Artist Board Member',
      pronouns: 'she/her',
      affiliation: null,
      image: Mangren,
      linkedin: null,
      bio: 'is a freshman at Columbia College Chicago majoring in Acting for the Screen and Stage. Her love for acting and dancing started in middle school. She started Acting in middle school as well but started dancing while starting at Columbia College Chicago.'
    },
    {
      id: bioId(),
      name: 'Dr. Candice Mason',
      role: 'Artist Board Member',
      pronouns: 'she/her',
      affiliation: null,
      image: Mason,
      linkedin: null,
      bio: 'is an educator, performer, scholar, and cultural worker. Her work exists at the intersection of Black feminist practice, theatre/dramatic studies, performance studies, and liberatory pedagogy.\n\nShe remains most curious about the dialogic and dialectic relationships between culture and the genre-bending expressive performances of Black folks and women.\n\nSome of her performance credits include work with Windy City Playhouse, Lifeline Theatre, and The Creative Co-Lab (Houston).'
    },
    {
      id: bioId(),
      name: 'Chelsea Bria Russell',
      role: 'Artist Board Member',
      pronouns: 'she/her',
      affiliation: null,
      image: Russell,
      linkedin: 'chelsea-bria-russell-pro',
      bio: 'is a Chicago-based actress, somatic movement educator, and arts administrator. Chelsea is a MFA Acting graduate of The Theatre School at DePaul University, class of 2025. She is a proud staff member at Black Ensemble Theater, a Judith Leibowitz Award recipient, and certified yoga instructor.\n\nWith a background spanning performance, movement, and arts administration, Chelsea brings a grounded, intentional approach to storytelling. She is deeply committed to equity in the arts, and is passionate about amplifying underrepresented voices and contributing to artistic spaces that are both inclusive and empowering.\n\nIn addition to her artistic work, Chelsea has contributed to arts organizations such as the National Black Theatre and Crossroads Theatre Company, supporting initiatives that center access and representation. As an Auxiliary Board Member for the Chicago Artist Guide, she is committed to fostering community, resource-sharing, and sustainability within the artistic community.\n\nChelsea’s work is rooted in clarity, depth, and a desire to build meaningful, collaborative artistic spaces in Chicago and beyond.'
    },
    {
      id: bioId(),
      name: 'Delaney Spielman',
      role: 'Artist Board Member',
      pronouns: 'she/her',
      affiliation: null,
      image: Spielman,
      linkedin: 'delaney-spielman-46b679207',
      bio: 'Originally a bassist from Colorado, Delaney moved to Chicago to explore diverse musical and ensembles and experiences. After completing a Bachelor in Arts Leadership and Classical Bass. She has established a diverse professional background in arts administration, house management, and audience experience. Having held production and administrative roles at over 20 theaters and orchestras, she is committed to crafting meaningful experiences for both performers and audiences. Some of her professional highlights include working with the Newberry Consort, Broadway in Chicago, Lookingglass Theatre, and Teatro Zinzanni. These ensembles range from medieval orchestra, circus cabaret, broadway theatre, and all genres of musical performance. She has also completed a European orchestra tour, and a two year research dissertation on broadening audience experiences and accessibility within orchestras.'
    },
    {
      id: bioId(),
      name: 'Ali Uyao',
      role: 'Artist Board Member',
      pronouns: 'she/her',
      affiliation: null,
      image: Uyao,
      linkedin: 'alishiana-uyao',
      bio: "is a multi-hyphenate Filipino theatre artist based in Chicago. She is excited to join Chicago Artist Guide's Artist Auxiliary Board! Ali has a BA in Theatre Performance and Women's Studies from the University of Illinois-Chicago. She's involved with theatres like Bramble, Backyard Theatre Co., Forest Theatre Company, GreatWorks, AlphaBet Soup Productions, Facility Theatre, and Pegasus Theatre. Current credits include The Pets (SM, Bramble Theatre), Charlotte's Web (ASM, AlphaBet Soup Productions), Don't Let the Pigeon Drive the Bus! (SM, GreatWorks Theatre), Fractured Fairy Tales (SM Cover, GreatWorks Theatre), Number the Stars (SM Cover, GreatWorks Theatre), and Urinetown (Technical Director, SennArts Music Theatre). Previous credits include the 39th Annual Young Playwrights' Festival (ASM, Pegasus Theatre), Tender Napalm (SM, Backyard Theatre Co.), Endgame (Facility Theatre, SM), FTC's Two Noble Kinsmen, On The Verge and The Misanthrope (SM), Bramble Theatre Company's Rooted, Racecar Racecar Racecar (ASM) and Blood of my Mother's (SM), and UIC Theatre's Smart People (Ginny) and Fefu and Her Friends (Christina). Outside of that show, Ali and her collaborators are working on a devised piece called Garden of Eve with the Riveter Theatre. Much love and thanks to her loved ones who have supported her in her artistic journey. FB/Insta: alishiana_uyao"
    }
  ],
  operations: [
    {
      id: bioId(),
      name: 'Anna Schutz',
      role: 'Executive Director',
      pronouns: 'she/her',
      affiliation: null,
      image: Schutz,
      linkedin: 'annaschutz',
      bio: "holds a BFA in Acting from the University of Illinois Urbana-Champaign and has worked in Chicago as a performer, playwright, and producer for over a decade. She co-founded the storefront theatre Brown Paper Box Co. There, she served as Managing Director during its 11 years of operation before completing her Master of Nonprofit Management degree at DePaul University.\n\nAnna currently works as a Senior Associate with Public Financial Management Advisors, coordinating work with government agencies and nonprofits. Previously, Anna worked at Apple Inc. as a Specialist and Global Retail Training Facilitator, as the Guest Experience Manager in DePaul University's Admission Department, and as a Senior Administrator at Boston Consulting Group.\n\nShe founded Chicago Artist Guide believing that technology can create access, and theatre can create change. Sunday in the Park with George will never not make her cry. More info at www.annaschutz.com."
    },
    {
      id: bioId(),
      name: 'Alexandria Alyse Moorman',
      role: 'Development Director',
      pronouns: 'she/her',
      affiliation: null,
      image: Moorman,
      linkedin: 'alexandria-moorman-309a5b170',
      bio: 'holds a BFA in Acting from Emerson College and is a proud recipient of the Isabel Sanford Award. While working in partnership with Cacique Youth Learning Center in the South End of Boston she helped lead and coordinate a classroom of Pre-K students through artistic workshops culminating in producing presentations of their original work. \n\nAlexandria’s credits as a performer/writer/poet/ improviser have been in collaboration with and on the stages of The MCA, iO (Diversity Scholar recipient), The Haitian American Museum, The Second City, The Den Theater, Brown Paper Box Co., Stage 773, The Annoyance, MPAACT Theater, Rough House Theater Co. among others. She is an ensemble member of The Not That Late Show, a monthly late night style talk show. She can also be heard as a recurring guest on the podcast Lifetime Uncorked, which was featured in O Magazine last year. \n\nFilm credits include How to Re-caulk Your Tub (Elevated FF - Audience Award Winner, Calgary Underground FF - Best Int. Short Winner), Mid 30’s Martyr (Austin Revolution FF - Best Actress Short Winner, Cindependent FF, San Angelo Revolution FF - Best Actress nom.), Ponytail (Shortcut 100 Int. FF - Winner: Audience Choice, Best Chicago Made, Female Filmmaker). When not dreaming of winning the lottery, she enjoys watching Bravo TV for all that nonsense, flexing her mixology skills, traveling and eating well with her partner John.'
    },
    {
      id: bioId(),
      name: 'Camille Cadenhead',
      role: 'Business Manager',
      pronouns: 'they/she',
      affiliation: null,
      image: Cadenhead,
      linkedin: 'camille-cadenhead-9708b0174',
      bio: 'is an actor and writer of Chicago, having worked with numerous theater companies including 16th Street Theater, Red Tape Theater, Prologue Theater, Eta Theater, MPAACT Theater, and many others. They have also co-written sketch shows performed at The Second City Training Center with sketch group, The Family Robot. Camille’s training in theater and performance includes The Second City Conservatory, iO, and most recently The Black Box Academy. Their BA is in Theater from Columbia College.'
    },
    {
      id: bioId(),
      name: 'Michelle E. Benda',
      role: 'Program Manager',
      pronouns: 'she/her',
      affiliation: null,
      image: Benda,
      linkedin: 'michellebenda',
      bio: "After spending several years as a lighting designer and assistant in the Chicago theatre scene, Michelle is currently pivoting to grant writing work. Michelle's experience navigating the world as a wheelchair user has also made her a passionate advocate for accessibility, especially in performing arts spaces, both on stage and off. She is excited to join the Chicago Artist Guide and be part of this mission!"
    },
    {
      id: bioId(),
      name: 'Jennifer Ledesma',
      role: 'Social Media Manager',
      pronouns: 'she/her',
      affiliation: null,
      image: Ledesma,
      linkedin: 'jenniferledesma',
      bio: 'is a Chicago-based actor, singer, dancer, and musician who received her Bachelor of Arts in Musical Theatre from Columbia College Chicago. She is thrilled to be a part of the Chicago Artist Guide team as she has always had a passion for advocacy work and diversifying the theatre community is a value that is close to her heart. Within equity and diversity circles, she has been a Board Member for Chicago Arts Access, and worked within other nonprofits like Genders and Sexualities Network, Queer Cultural Center, and Orange County Human Relations. Most recently, she served as a Program Coordinator in Community Engagement at the Office for Diversity, Literacy, and Outreach Services (ODLOS) at American Library Association.\n\nAs a theatre artist, Jennifer has worked with theaters like Drury Lane, Porchlight Music Theatre, Kokandy Productions, TheatreSquared, Little Theatre on the Square, and Music Theatre Works, among others. She is proudly represented by Big Mouth Talent. In her free time, she loves consuming too much reality television, reading romance novels with just a bit of spice, and exploring different neighborhoods around Chicago that always feel like home.'
    },
    {
      id: bioId(),
      name: 'Brianna Walton',
      role: 'Marketing Manager',
      pronouns: 'she/her',
      affiliation: null,
      image: Walton,
      linkedin: 'briannamwalton',
      bio: 'is a marketing professional who focuses on helping nonprofits and mission-driven organizations grow. Her work with Chicago Artist Guide is fueled by her belief that everyone should have access to the resources they need to succeed. She earned her BA in International Relations and Business Management from Agnes Scott College, where she first discovered her interest in social impact. When she isn’t working, Brianna stays busy sketching, painting, watching movies, going to live shows, and enjoying the outdoors.'
    },
    {
      id: bioId(),
      name: 'Sara Newsome',
      role: 'Development Manager',
      pronouns: 'she/her',
      affiliation: null,
      image: Newsome,
      linkedin: 'saranewsome',
      bio: 'graduated with a BA in Japanese Studies from Gettysburg College and an MA and PhD in East Asian Studies from Washington University in St. Louis and UC Irvine respectively. Her focus during her studies was on the intersection of theater, religion and activism in Japan. Currently, Sara hopes to use her skills and experiences in grant writing, management and development to make a positive impact on the world around her.'
    },
    {
      id: bioId(),
      name: 'Hannah Adamy',
      role: 'Development Associate',
      pronouns: 'she/her',
      affiliation: null,
      image: Adamy,
      linkedin: 'hpadamy',
      bio: 'holds a BA in Music from the College of New Jersey and a MA in Performance Studies from Texas A&M. She currently works as a coordinator at the University of California, Davis and is pursuing a career in fundraising and development. She has worked as a consultant with the Girls Rock Camp Alliance (GRCA) and the Library of Musiclandria. She is also an award-winning writer, and her work has been published in Studies in Musical Theatre and Public: A Journal of Imagining America.'
    },
    {
      id: bioId(),
      name: 'Ciara Meyers',
      role: 'Administrative Associate',
      pronouns: 'she/her',
      affiliation: null,
      image: Meyers,
      linkedin: 'ciaranicolesimmons',
      bio: "is an administrative professional and training coordinator with a strong foundation in Learning & Development, client engagement, and cross-functional collaboration. With a bachelor's degree in Journalism and years of experience across finance, construction, and legal sectors, she brings a dynamic and detail-oriented approach to organizational training and operational excellence.\n\nCurrently, Ciara leads virtual training programs for hundreds of participants, manages analyst onboarding and development, and partners closely with HR to align training strategies with business goals. Her leadership in Employee Resource Groups and DEI initiatives reflects her passion for inclusive workplace culture and mentorship."
    }
  ],
  technical: [
    {
      id: bioId(),
      name: 'Jeannine Fischer',
      role: 'Head of Product',
      pronouns: 'she/her',
      affiliation: null,
      image: Fischer,
      linkedin: 'jeanninefischer',
      bio: "is an innovative product leader with experience in launching and scaling products at high-growth marketplace startups. Recognized on Product50 for her impact at Avail Car Sharing, Jeannine brings rich experience from diverse roles in Product, Finance, and Marketing at Allstate's startups and core businesses. Fueled by deep user empathy and a passion for people, she extends her impact beyond product management. As an inclusion advocate, Jeannine served as the President of the Young Professionals organization at Allstate, driving resources for underserved communities and influencing inclusive benefits decisions for 40K+ employees. Beyond tech, she's a music aficionado and outdoor enthusiast. When not building products, you'll find her catching the latest concert or exploring mountains through rock climbing or skiing."
    },
    {
      id: bioId(),
      name: 'Mhari Goldstein',
      role: 'Product Manager',
      pronouns: 'she/her',
      affiliation: null,
      image: Goldstein,
      linkedin: 'mharigoldstein',
      bio: 'Mhari is a relentless advocate for the power of technology to drive global nonprofit mission delivery. From early days of digital advocacy at an anti-gun violence NGO to implementing new products and platforms at an international service organization, Mhari believes that responsible technology can connect and empower communities. When not behind the screen she can often be found hiking a trail, cutting a rug, or rolling dice at a D&D table.'
    },
    {
      id: bioId(),
      name: 'Alex Jewell',
      role: 'Lead Engineer',
      pronouns: 'he/him',
      affiliation:
        'Senior Engineering Manager @ Institutional Cash Distributors (ICD)',
      image: JewellAlex,
      linkedin: 'alexjewellcom',
      bio: "is a socially-driven senior UI software engineer in healthcare, blockchain and decentralization consultant and activist, and leftist technocratic ghostwriter for political organizations, lobbying groups, and biotech advocacy. A DePaul University alumni, Alex Jewell is happiest when combining his talents with conscious efforts to disrupt and cause positive change. He is happily married with two dogs and lives in the South Loop. Alex's social media persona, @bestfoodalex, has also carved out a space in the Chicago culinary scene, supporting restaurants and hospitality by creating mouthwatering content."
    },
    {
      id: bioId(),
      name: 'Christopher Knuteson',
      role: 'Senior Engineer',
      pronouns: 'he/him',
      affiliation: null,
      image: Knuteson,
      linkedin: 'themuffinman',
      bio: 'is a software engineer passionate about building intuitive, data-driven experiences. With a focus on search technologies, web applications, and serverless architectures, he enjoys solving complex problems with clean, efficient code. Outside of work, he loves spending time with his family and exploring new places.'
    },
    {
      id: bioId(),
      name: 'Ginger Glendinning',
      role: 'UX Designer/Researcher',
      pronouns: 'she/her',
      affiliation: null,
      image: Glendinning,
      linkedin: 'gingerglendinning',
      bio: "is a product designer passionate about inclusive and accessible design. She aims to create experiences that not only delight users but are also adaptable to their needs. Her love for web design began at the age of thirteen, when she coded and designed fan websites for cartoons she enjoyed watching. Ginger received her Master's degree in Human-Computer Interaction with distinction from DePaul University in 2015. Ginger resides in the Chicagoland area. In her free time, she likes to explore Chicago's food scene, travel, and volunteer as a tech tutor with older adults."
    }
  ],
  artistAdvisory: [
    {
      id: bioId(),
      name: 'Jordin Jewell',
      role: 'Owner, West Loop Soul',
      pronouns: 'she/her',
      affiliation: null,
      image: JewellJordin,
      linkedin: 'jordinjewell',
      bio: "For over 10 years, Jordin has specialized in marketing, dabbling in everything from graphic design to business development to strategy.\n\nThrough her roles ranging from Social Media Strategist to Director of Marketing to Associate Strategic Director, she worked tirelessly to ideate unique, thoughtful solutions to revive marketing programs for clients ranging from local nonprofits to national brands. While she loved the work, her true passion is helping small businesses stand out on social media. That's why she left her full-time agency career to focus on building a content marketing boutique agency with an emphasis on organic social media.\n\nAs the founder of West Loop Soul, she helps small business owners and entrepreneurs uncover the soul of their brand through content marketing while making a big impact with a reasonable budget.\n\nShe's excited to bring this work to Chicago Artist Guide, helping support the vibrant Chicago theater community and the diverse talents that comprise it.\n\nWhen she's not creating content for her clients, you can find her at the dog park with her boys Chicken and Waffles."
    },
    {
      id: bioId(),
      name: 'Luciana Mendez Gonzalez',
      role: 'CAG Founding Engineer',
      pronouns: 'she/her',
      affiliation: null,
      image: MendezGonzalez,
      linkedin: 'lmg25',
      bio: 'is a data engineer currently based in Guadalajara, Mexico. She graduated from DePaul University with a degree in Mathematics and Computer Science in 2019. As the daughter of a theatre owner and producer, Luciana is excited to give back to a community that has given her so many memories and love. When she is not programming you can find her taking long walks, listening to music, or attending a concert.'
    },
    {
      id: bioId(),
      name: 'RJ Silva',
      role: 'Artistic Director, Circa Pintig',
      pronouns: 'he/him',
      affiliation: null,
      image: Silva,
      linkedin: 'rj-silva-3080b178',
      bio: "is a creative professional in Chicago, born and raised in the Philippines, and a theatre alumni from Loyola University Chicago, RJ has previously worked as a producer for Disney and performed and produced theatre in Orlando. His current creative pursuits include playwriting, having previously written for PlayGround Chicago in their inaugural year, and as a producer and director for 2nd Story Chicago. He also creates content for The Ampliverse, an inclusive multimedia channel for pop culture, hosting and producing the podcast Did You Read the Group Chat? and videos for RJ's Food Rocks."
    },
    {
      id: bioId(),
      name: 'Zev Steinrock',
      role: 'Assistant Professor of Acting, UIUC',
      pronouns: 'he/him',
      affiliation: null,
      image: Steinrock,
      linkedin: null,
      bio: 'is a professional actor, fight director, intimacy director, and movement teacher. Zev is currently an Assistant Professor at the University of Illinois, and holds an MFA in Acting from Michigan State University, along with certifications in teaching yoga and for college teaching. His ongoing research centers around trauma-informed movement and stage combat training.\n\nAfter earning his BFA in Acting from Illinois Theatre in 2008, Professor Steinrock spent several years as an actor and fight director for a variety of professional Theatre including Shattered Globe, the Circle Theatre, and Definition Theatre in Chicago, and the renowned Paper Mill Playhouse in New Jersey. He is also a founding member of Chicago’s Brown Paper Box Theatre.\n\nProfessor Steinrock is a Certified Intimacy Director with Intimacy Directors and Coordinators, Inc., a Certified Stage Combat Teacher with the Society of American Fight Directors, and has worked as a choreographer all over the country. Professor Steinrock most recently spent a year in Los Angeles teaching at the Stella Adler Academy of Acting, UC Irvine, and UC San Diego, along with choreographing intimacy for the South Coast Repertory Theatre.'
    }
  ]
};

export default bios;
