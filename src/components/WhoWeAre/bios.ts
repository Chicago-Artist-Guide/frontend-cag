// Board of Directors
import McCall from '../../images/who-we-are/board/Board_McCall.jpg';
import Dolezalek from '../../images/who-we-are/board/Board_Dolezalek.png';
import Lee from '../../images/who-we-are/board/Board_Lee.jpg';
import Adler from '../../images/who-we-are/board/Board_Adler.jpg';
import Frazier from '../../images/who-we-are/board/Board_Frazier.jpg';
import Webb from '../../images/who-we-are/board/Board_Webb.jpg';
import Laws from '../../images/who-we-are/board/Board_Laws.jpg';

// Artist Auxiliary Board
import Ferro from '../../images/who-we-are/board/Board_Ferro.png';
import Silva from '../../images/who-we-are/board/Board_Silva.png';
import Lewis from '../../images/who-we-are/board/Board_Lewis.png';
import Moorman from '../../images/who-we-are/operations/Staff_Moorman.png';
import Stiles from '../../images/who-we-are/board/Board_Stiles.png';
import Goins from '../../images/who-we-are/board/Board_Goins.jpeg';

// Business Operations
import Schutz from '../../images/who-we-are/board/Board_Schutz.png';
import Torres from '../../images/who-we-are/board/Staff_Torres.jpg';
import Walton from '../../images/who-we-are/operations/Staff_Walton.png';
import Brown from '../../images/who-we-are/operations/Staff_Brown.png';
import Mwakasisi from '../../images/who-we-are/operations/Staff_Mwakasisi.jpg';
import Wills from '../../images/who-we-are/operations/Staff_Wills.jpeg';
import Adamy from '../../images/who-we-are/operations/Staff_Adamy.jpg';

// Site Development
import JewellAlex from '../../images/who-we-are/technical/Staff_Jewell.jpg';
import DeSant from '../../images/who-we-are/technical/Staff_DeSant.png';
import Hernandez from '../../images/who-we-are/technical/Staff_Hernandez.png';
import Hoskins from '../../images/who-we-are/technical/Staff_Hoskins.png';
import MendezGonzalez from '../../images/who-we-are/board/Board_Mendez_Gonzalez.jpg';
import Fischer from '../../images/who-we-are/technical/Staff_Fischer.jpg';
import Rose from '../../images/who-we-are/technical/Staff_Rose.jpg';

// Advisory Board
import JewellJordin from '../../images/who-we-are/operations/Staff_Jewell.jpg';
import Steinrock from '../../images/who-we-are/board/Board_Steinrock.jpg';
import Voghel from '../../images/who-we-are/artists/Artist_Voghel.png';

const bioId = () => (<any>crypto).randomUUID();

const bios = {
  board: [
    {
      id: bioId(),
      name: 'Joey M. McCall, Esq.',
      role: 'President',
      pronouns: 'he/him',
      affiliation:
        'Founder & Managing Partner, McCall | Atten; Founder & Chief Vision Officer, Law Lynx',
      image: McCall,
      linkedin: 'joey-m-mccall-esq-303356143',
      bio: 'is the founding Principal and Managing Partner of McCall | Atten, International, PLLC. McCall | Atten, International provides legal representation in the following areas: Real Estate Transactional Services, Real Estate Litigation, Civil Litigation, Immigration, and Outside General Counsel Services for Small to Mid-Sized Businesses. With a strong foundation rooted in establishing quality long-lasting relationships, both business and personal, Mr. McCall identifies the most effective legal solutions to the individual legal needs his clients may encounter during their professional and personal lives. Mr. McCall continuously strives to resolve all conflicts for his clients in the most optimal and effective manner.'
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
      bio: 'In the workplace or in the community, Zeke has a passion for creating spaces in which people can thrive. As a People & Culture professional, Zeke strives to unite people together by encouraging conversations and empowering others. Over the course of his time at What if Syndicate, Zeke has overseen a near 200% increase of staff, over 6 new property openings, labor laws and employee relations in over 5 markets, and growth and development planning for several leaders and operators within our brands.\n\nWith a BFA in Musical Theatre from the Chicago College of Performing Arts, Zeke has spent time actively involved in the Chicago theatre community both on and off-stage. As a professional photographer, Zeke specializes in headshots, events, and production photography/B-roll. @iAmZekeD'
    },
    {
      id: bioId(),
      name: 'Tatum Lee',
      role: 'Secretary',
      pronouns: 'she/her',
      affiliation: 'Consultant, Boston Consulting Group',
      image: Lee,
      linkedin: 'tatumlee',
      bio: 'is currently a consultant at the Boston Consulting Group, and has worked with companies in the technology, retail, and entertainment industries. Tatum graduated from the University of Texas, where she studied Finance and Liberal Arts. She’s had a passion for theatre her whole life, and has previously worked as a stage manager and production assistant for various companies.'
    },
    {
      id: bioId(),
      name: 'Emily Adler',
      role: 'Treasurer',
      pronouns: 'she/her',
      affiliation: 'Chef/Owner, The Buttery Babe',
      image: Adler,
      linkedin: 'emily-adler-8830659',
      bio: 'is a Chicago-area chef and hospitality jill-of-all trades.  After years in high end, fast paced hotels and catering, Emily moved on to running a 15 room bed and breakfast with a 50 seat restaurant in upstate New York.  Upon her return to Chicago, Emily focused on raising the standard of dining in the elder care sector.  Five years of managing cheese shops and grocery stores rounds out her resume.  She now enjoys catering small dinners with curated beverage pairings, working in her organic vegetable garden and support various non-profit organizations.'
    },
    {
      id: bioId(),
      name: 'Cheryl Frazier',
      role: 'Artist Board Liaison',
      pronouns: 'she/her',
      affiliation:
        'Director of Test Adjudication, Southland College Prep Charter HS',
      image: Frazier,
      linkedin: 'cheryl-frazier-28938154',
      bio: 'hails from the Chicago south suburb of Markham, Illinois whose love for theatre was nurtured by competing in speech and drama at Thornwood High School. Cheryl Frazier is a nationally recognized forensics educator, who has served as Director of Forensics and Theatre at Southland College Prep Charter since 2011. Frazier started her teaching career at South Holland (Illinois) Thornwood High School in 1997 as a speech and science teacher and held various extracurricular positions, including theatre manager, head speech coach, and assistant play director. She additionally served Thornwood as the Fine Arts Department Chair and Arts and Communication House Leader before becoming the Fine Arts Area Instructional Leader for District 205. As the group interpretation director at both Thornwood and Southland College Prep, she was a seven-time state champion, five-time state runner up and six-time finalist director. Additionally, under Frazier’s direction numerous students have won Illinois High School Association (IHSA) regional, sectional, and state titles and National Speech and Debate Association national speech titles. Frazier was named the 2018-19 Outstanding Debate and Theatre Educator for the National Federation of High School’s (NFHS) central section of Illinois, Indiana, Iowa, Michigan and Wisconsin and is a 2020 recipient of the NFHS Citation award. As she moves from directing and coaching to acting, the role of Lena “Mama” Younger remains her favorite, playing it three times since 2014. Frazier is a graduate of Drake University, and also earned a master’s degree in Communications Studies from Governors State University, as well. Frazier believes in the power of the spoken word and the impact BIPOC artists have in using their gifts to heal a community.'
    },
    {
      id: bioId(),
      name: 'Alicia Webb',
      role: 'Board Development Co-Chair',
      pronouns: 'she/her',
      affiliation: 'Principal, Bright Spot Public Relations',
      image: Webb,
      linkedin: 'alicia-webb-3536784',
      bio: 'is an award-winning marketing and communications professional with experience in a wide variety of industries including politics, manufacturing, and pharmaceuticals. A former journalist, she loves telling stories about people doing extraordinary things. She began her career as a general assignment reporter with ABC News in Maryland. She previously worked as a personal shopper and event specialist with Macy’s. Alicia has also held roles in media relations, event planning and brand management with several organizations including BCBG Max Azria and Baxter Healthcare Corporation. She holds a B.A. in Journalism and Political Science from Indiana University. Alicia is also a certified life coach. She currently serves as a mentor for the Good Food Accelerator, where she helps entrepreneurs build and establish their businesses. Alicia loves news, sports, travel, politics, Chicago’s theatre and art scene and all things related to pop culture. She serves on the Board of Directors for the Chicago Chapter of the Indiana University Alumni Association. She is also a member of the Indiana University Media School Alumni Board. Most recently, Alicia was a board member for BoHo Theatre.'
    },
    {
      id: bioId(),
      name: 'Lisa Laws',
      role: 'Board Member',
      pronouns: 'she/her',
      affiliation: 'Chief Operating Officer, 1871',
      image: Laws,
      linkedin: 'lisalaws',
      bio: "is a visionary leader committed to fostering growth and opportunity within the arts community. Born and raised in Hyde Park, Chicago, Lisa has deep roots in the city and a strong connection to its vibrant cultural landscape. With over 15 years of executive experience, Lisa serves as the Chief Operating Officer of 1871, a prominent non-profit tech hub in Chicago.\n\nBeyond her professional endeavors, Lisa is deeply passionate about supporting artists and cultural initiatives. Her commitment to social value is evident in her pivotal roles at Mayor Rahm Emanuel's Office and the Department of Cultural Affairs and Special Events (DCASE). In these positions, she led daily operations, coordinated significant events, and managed comprehensive infrastructure projects, demonstrating resilience and strategic insight in addressing the diverse needs of Chicago's vibrant arts community.\n\nLisa's academic achievements include an MBA from Northwestern's Kellogg School of Management, a Graduate Certificate in Infrastructure Engineering and Management from the Illinois Institute of Technology, and dual degrees from Tulane and Xavier University of Louisiana. Recognized for her contributions to STEM education, innovation, and diversity, Lisa is dedicated to advancing opportunities for artists and cultural organizations.\n\nAs a member of the Board of Directors for the Chicago Artist Guide, Lisa is poised to make a lasting impact, leveraging her expertise to support and elevate the vibrant arts community in Chicago and beyond. Lisa's passion for music and performance is evident in her involvement in the Kenwood Academy Concert Choir and the Chicago Children's Choir, now Uniting Voices Chicago, where she had the opportunity to tour extensively across the US and the globe."
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
      bio: 'is honored to be part of the Artists Board at Chicago Artist Guide. He is a professional stage and screen actor in Chicago, IL who is passionate with finding ways to help make Chicago theater more diverse, as well as to support new work in theater. Recent selected theater collaboration with Oil Lamp Theater, Sigman Brothers, Three Cat Productions, and Act Your Page. Van also won two BroadwayWorld Chicago Awards for performance in 2021. @therealvanferro'
    },
    {
      id: bioId(),
      name: 'RJ Silva',
      role: 'Vice President',
      pronouns: 'he/him',
      affiliation: null,
      image: Silva,
      linkedin: 'rj-silva-3080b178',
      bio: "is a creative professional in Chicago, born and raised in the Philippines, and a theatre alumni from Loyola University Chicago, RJ has previously worked as a producer for Disney and performed and produced theatre in Orlando. His current creative pursuits include playwriting, having previously written for PlayGround Chicago in their inaugural year, and as a producer and director for 2nd Story Chicago. He also creates content for The Ampliverse, an inclusive multimedia channel for pop culture, hosting and producing the podcast Did You Read the Group Chat? and videos for RJ's Food Rocks."
    },
    {
      id: bioId(),
      name: 'Jorie Goins',
      role: 'Secretary',
      pronouns: 'she/her',
      affiliation: null,
      image: Goins,
      linkedin: 'joriejgoins',
      bio: "is a dancer based out of Chicago, Ill. Jorie earned a bachelor's degree in journalism with a minor in dance from Northwestern University in 2016. While at Northwestern, Jorie was a member of Tonik Tap, Northwestern's premiere tap dance company where she choreographed five original pieces. Jorie has danced with Noumenon Dance Ensemble, Praize Productions' Rize Pro-Elite company, and as a guest performer with Chicago Tap Theatre. She has performed works choreographed by Brenda Bufalino, Rich Ashworth, Mark Yonally, Nicole Clarke Springer and April Torneby."
    },
    {
      id: bioId(),
      name: 'James Lewis',
      role: 'Artist Board Member',
      pronouns: 'he/him',
      affiliation: null,
      image: Lewis,
      linkedin: null,
      bio: 'is a Chicago Actor and Dad originally from Connecticut. Excited to be apart of the Artist Board, his previous Chicago Theatre Credits: The Secret Council (First Folio Theatre), The Last Pair of Earlies (Raven Theatre), Short Changed (Factory Theatre), YPF at Pegasus (Pegasus Theatre), Titus Andronicus (Haven Theatre), Grace, Or the art of climbing (Brown Paper Box co). His TV credits include: 2 Broke Girls, True Blood and Real Husbands of Hollywood. James also attended The Theatre School at DePaul University for undergrad. James also is a writer and multi-instrumentalist but his greatest job is being a dad to the two greatest kids in the world, Amari and Naomi.'
    },
    {
      id: bioId(),
      name: 'Rachel Stiles',
      role: 'Artist Board Member',
      pronouns: 'she/her',
      affiliation: null,
      image: Stiles,
      linkedin: 'rachelannestiles',
      bio: "is a theatre professional and artist working in Milwaukee and Chicago with a specially in wigs and makeup. Her resume includes Lyric Opera of Chicago, Florentine Opera, Central City Opera, Broadway in Milwaukee, and The Milwaukee Rep, among others. A midwest girl at heart, her passion is helping people get a head's start in working in the arts, no matter their background. She created Stage Creatives Network to help theatre professionals find peace, prosperity and joy through the 4 pillars of a sustainable career: connection, financial literacy, work-life balance and self expression. If it's all about who you know, let's get to know each other!"
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
      bio: "holds a BFA in Acting from the University of Illinois Urbana-Champaign and has worked in Chicago as a performer, playwright, and producer for over a decade. She co-founded the storefront theatre Brown Paper Box Co. and served as Managing Director during its 11 years of operation. Anna completed her Master of Nonprofit Management at DePaul University where her research was on Representation in Nonprofit Performing Arts Leadership. During that time she was the manager of DePaul’s Undergraduate Admission daily operations and guest experience where she had the privilege of leading a team of students, focusing on their professional development. ​She served twice as the TA for DePaul's Women in Chicago Theatre course exposing first year students to intersectional feminist theory through field trips to performances around the city. Previously, Anna facilitated technical and customer service training during her 6 years with Apple Inc. in its Chicago stores and around the world on its Global Retail Training team. She founded Chicago Artist Guide with the belief that technology can create access, and theatre can create change. Sunday in the Park with George will never not make her cry. More info at www.annaschutz.com."
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
      name: 'Yazmin Torres',
      role: 'Business Manager',
      pronouns: 'she/her',
      affiliation: null,
      image: Torres,
      linkedin: 'yazmint',
      bio: 'holds a BA from the University of Illinois at Chicago and an MBA from DePaul University. Yazmin is a driven, problem solving professional with great interpersonal skills and a commitment to team success. She currently is the coordinator of business services and financials at the UIC School of Architecture. Prior to joining the staff at UIC, she worked in a variety of fields, including business operations and inventory management for start-up companies. At DePaul University, Yazmin explored her interests in supply-chain data management as the VP of the Supply Chain Management Society and in community-building as a crisis intervention advocate. As an MBA student, she was able to see how her passion for social justice issues, coordination, and collaboration with channel partners interests.'
    },
    {
      id: bioId(),
      name: 'Brianna Walton',
      role: 'Marketing Manager',
      pronouns: 'she/her',
      affilitation: null,
      image: Walton,
      linkedin: 'briannamwalton',
      bio: 'is a Digital Marketing enthusiast who enjoys creating written and visual content. She has always been an extremely passionate writer and a social justice advocate. Brianna was able to explore these interests during her studies at Agnes Scott College where she earned a Bachelor of Arts degree in International Relations and Business Management. Previously, she was active in student organizations including Her Campus (as a Content Creator and Campus Correspondent) and Mortar Board (as a Director of Communications). She was also a Marketing intern at CARE USA, which allowed her to gain experience in website content accessibility. She is motivated by the idea of helping other people have equitable access to opportunities and resources that will allow them to pursue their life goals. During her free time, Brianna enjoys listening to music of pretty much any genre, sketching, painting, and spending time outdoors. She is also an animal lover and enjoys spending time caring for her two pet turtles along with almost any other animals she happens to cross paths with.'
    },
    {
      id: bioId(),
      name: 'Hannah Adamy',
      role: 'Development Associate',
      pronouns: 'she/her',
      affilitation: null,
      image: Adamy,
      linkedin: 'hpadamy',
      bio: 'holds a BA in Music from the College of New Jersey and a MA in Performance Studies from Texas A&M. She currently works as a coordinator at the University of California, Davis and is pursuing a career in fundraising and development. She has worked as a consultant with the Girls Rock Camp Alliance (GRCA) and the Library of Musiclandria. She is also an award-winning writer, and her work has been published in Studies in Musical Theatre and Public: A Journal of Imagining America.'
    },
    {
      id: bioId(),
      name: 'Tumpale Mwakasisi',
      role: 'Social Media Associate',
      pronouns: 'she/her',
      affilitation: null,
      image: Mwakasisi,
      linkedin: 'tumpalemwakasisi',
      bio: "is Chicago-based content creator who showcases the city's diverse food and culture through her videos and reviews at @malortandmoet. She creates engaging videos and reviews for various online platforms, sharing her insights and recommendations with her audience and beyond. Previously, Tumpale worked in tech program management for companies like Webflow and LinkedIn. She also has digital marketing experience from her previous roles at Bottle & Bottega and Northwestern. Tumpale is passionate about supporting local businesses and communities, and she is excited to join Chicago Artist Guide. She hopes to contribute to the organization's mission and vision with her skills and experience. When she is not creating content, Tumpale likes to watch Youtube and movies, play video games, listen to music, and watch TV."
    },
    {
      id: bioId(),
      name: 'Abby Wills',
      role: 'Administrative Associate',
      pronouns: 'she/her',
      affilitation: null,
      image: Wills,
      linkedin: 'abbydwills',
      bio: "is Chicago-based content creator who showcases the city's diverse food and culture through her videos and reviews at @malortandmoet. She creates engaging videos and reviews for various online platforms, sharing her insights and recommendations with her audience and beyond. Previously, Tumpale worked in tech program management for companies like Webflow and LinkedIn. She also has digital marketing experience from her previous roles at Bottle & Bottega and Northwestern. Tumpale is passionate about supporting local businesses and communities, and she is excited to join Chicago Artist Guide. She hopes to contribute to the organization's mission and vision with her skills and experience. When she is not creating content, Tumpale likes to watch Youtube and movies, play video games, listen to music, and watch TV."
    },
    {
      id: bioId(),
      name: 'Missy Staros',
      role: 'Grant Writer',
      pronouns: 'she/her',
      affilitation: null,
      image: Brown,
      linkedin: 'missy-brown-a956a832',
      bio: "has been in leadership with Trader Joe's for the last 28 years. With strong business acumen and a caring, inclusive, and community-minded approach, she has been regarded as a top leader and mentor in the company. She has a BA in Sociology, MA in Educational Leadership, and certification in Grant Writing. She began her grant writing journey to help the community on a different level and is optimistic for the future. Her varied interests include attending the theatre and live music, hiking, reading WWII fiction and mysteries of all kinds, yoga, cooking for friends, wine tasting, watching Top Chef, and photographing a sunset."
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
      name: 'Dana Rose',
      role: 'Product Manager',
      pronouns: 'she/her',
      affiliation: null,
      image: Rose,
      linkedin: 'dana-r-4b0633199',
      bio: 'is interested in the intersection of business and technology and passionate about transforming ideas into valuable user focused products. She is honored to be involved with Chicago Artist Guide and contribute to its mission.'
    },
    {
      id: bioId(),
      name: 'Alex Jewell',
      role: 'Engineering Lead',
      pronouns: 'he/him',
      affiliation:
        'Senior Engineering Manager @ Institutional Cash Distributors (ICD)',
      image: JewellAlex,
      linkedin: 'alexjewellcom',
      bio: 'is a socially-driven software engineering leader in banking innovation, focusing on innovation and web3 for consumer banking. Blockchain and decentralization consultant and activist. Artisan foodporn director and social media marketing expert at @bestfoodalex. Leftist ghostwriter for political organizations, global economic forums, and watchdog groups dealing with the Fourth Industrial Revolution, futurism, and decentralization.'
    },
    {
      id: bioId(),
      name: 'Grace DeSant',
      role: 'UX Designer',
      pronouns: 'she/her',
      affiliation: null,
      image: DeSant,
      linkedin: 'grace-desant',
      bio: "holds a BA in Theatre from Millikin University, where she also minored in dance. She has worked as a theatre artist in Chicago for the past decade as a performer, producer, director, choreographer, and prop designer. In the past, she was co-chair of the Executive Board for Awakenings, a nonprofit art gallery that makes visible the experiences of sexual assault survivors. She also moonlights as a burlesque performer and producer Foxie la Fleur and co-founded Crescent Moon Nerdlesque in 2018. Grace is passionate about creating equal opportunities for artists and advocates for pay transparency within the performing arts community. In 2020, Grace decided to dive into UX Design through General Assembly's immersive program to marry her creative flair for visual design and passion for helping others. She aims to get certified in accessibility design in the future. She is thrilled to continue her journey as a UX designer with Chicago Artist Guide!"
    },
    {
      id: bioId(),
      name: 'Nicole Hernandez',
      role: 'UX Designer',
      pronouns: 'she/her',
      affiliation: null,
      image: Hernandez,
      linkedin: 'nicolehernandez-design',
      bio: 'has an academic background in Child and Adolescent Development. After teaching at an elementary school for 8 years, she decided to pursue a different career path. She discovered UX/UI design and got her training through General Assembly User Experience Design Immersive course. When she’s not ‘designing’ you can find Nicole hanging out with her dog, Boo, working out, or trying the newest local restaurants.'
    },
    {
      id: bioId(),
      name: 'Alan Hoskins',
      role: 'Senior Frontend Engineer',
      pronouns: 'he/him',
      affiliation: null,
      image: Hoskins,
      linkedin: 'alanhoskins',
      bio: 'is a software engineer based out of Indianapolis. He has always had a passion for technology. With expertise in developing web applications, Alan is dedicated to finding effective solutions to unique challenges and contributing to the growth of his company.'
    },
    {
      id: bioId(),
      name: 'Luciana Mendez Gonzalez',
      role: 'Engineer',
      pronouns: 'she/her',
      affiliation: 'Data Engineer',
      image: MendezGonzalez,
      linkedin: 'lmg25',
      bio: 'is a data engineer currently based in Guadalajara, Mexico. She graduated from DePaul University with a degree in Mathematics and Computer Science in 2019. As the daughter of a theatre owner and producer, Luciana is excited to give back to a community that has given her so many memories and love. When she is not programming you can find her taking long walks, listening to music, or attending a concert.'
    }
  ],
  artistAdvisory: [
    {
      id: bioId(),
      name: 'Jordin Jewell',
      role: 'Advisory Board Member',
      pronouns: 'she/her',
      affilitation: 'Founder, West Loop Soul',
      image: JewellJordin,
      linkedin: 'jordinjewell',
      bio: 'has specialized in marketing for over 9 years, dabbling in everything from graphic design to business development to strategy. Through her roles ranging from Social Media Strategist to Director of Marketing to Associate Strategic Director, she worked tirelessly to ideate unique, thoughtful solutions to revive marketing programs for clients ranging from local nonprofits to national brands. While she loved the work, her true passion is helping small businesses stand out on social media. That’s why she left her full-time agency career to focus on building a content marketing boutique agency with an emphasis on organic social media. As the founder of West Loop Soul, she helps small business owners and entrepreneurs uncover the soul of their brand through content marketing while making a big impact with a reasonable budget. She’s excited to bring this work to Chicago Artist Guide, helping support the vibrant Chicago theater community and the diverse talents that comprise it. When she’s not creating content for her clients, you can find her at the dog park with her boys, Chicken and Waffles.'
    },
    {
      id: bioId(),
      name: 'Zev Steinrock',
      role: 'Advisory Board Member',
      pronouns: 'he/him',
      affiliation:
        'Assistant Professor of Acting, University of Illinois Urbana-Champaign',
      image: Steinrock,
      linkedin: null,
      bio: 'is a professional actor, fight director, intimacy director, and movement teacher. Professor Steinrock comes to us from Michigan State University, where he completed his MFA in Acting along with certifications in teaching yoga and for college teaching. His ongoing research centers around trauma-informed movement and stage combat training. After earning his BFA in Acting from Illinois Theatre in 2008, Prof. Steinrock spent several years as an actor and fight director for a variety of professional Theatre including Shattered Globe in Chicago and the renowned Paper Mill Playhouse in New Jersey. He is also a founding member of Chicago’s Brown Paper Box Theatre. Professor Steinrock is a Certified Intimacy Director with Intimacy Directors and Coordinators, Inc. and has worked as a choreographer all over the country. Prof. Steinrock most recently spent a year in Los Angeles teaching at the Stella Adler Academy of Acting, UC Irvine, and UC San Diego, along with choreographing intimacy for the South Coast Repertory Theatre. '
    },
    {
      id: bioId(),
      name: 'Alison Voghel',
      role: 'Advisory Board Member',
      pronouns: 'she/her',
      affiliation: 'Senior UX Designer, Acquia',
      image: Voghel,
      linkedin: 'alison-voghel',
      bio: 'received her BA in Environmental Design at CU Boulder in 2012 and her Masters in Architecture & Urban Design in 2017. She has worked in tech, architecture, urban design, and interior design but transitioned to UX and UI Design in 2020. Alison currently works full-time as a Senior UX Designer for a SaaS company based in Boston, remotely. She has never been involved in any theater-related organizations, but did have fun designing a theater for a student project. When not working or learning how to code, her creative outlet of choice is digital art/illustration.'
    }
  ]
};

export default bios;
