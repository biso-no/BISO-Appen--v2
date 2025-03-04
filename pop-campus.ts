import { databases } from "./lib/appwrite";


// Constants
const DATABASE_ID = 'app';
const COLLECTION_ID = 'campus';

// ID Mapping (based on the mapCampus object in your code)
const CAMPUS_IDS = {
    OSLO: '1',     // You mentioned this is already populated
    BERGEN: '2',
    TRONDHEIM: '3',
    STAVANGER: '4'
};

// Data for Bergen Campus
const bergenCampusData = {
    campusData: {
        description: 'Get the most out of your student life with BISO Bergen',
        studentBenefits: [
            'Exclusive events on campus',
            'Discounts in local businesses',
            'CV/Resume/LinkedIn guidance with Econa',
            '20% discount at Bertoni Lagunen',
            'Free portrait photo for your CV with BISO Media',
        ],
        businessBenefits: [
            'Company presentations to BI students',
            'Campus stands at Bergen',
            'Participation in major BISO Bergen events',
            'Professional days and academic events',
            'Building relationships with engaged students',
        ],
        careerAdvantages: [
            'Free company presentations',
            'Interview coaching with BISO HR',
            'Career-specific courses',
            'Relevant work experience',
            'CV portrait with BISO Media',
            'Participate in Career Days',
        ],
        socialNetwork: [
            'Join subgroups and committees',
            'Campus events',
            'Participate in Winter Games',
            '40% discount on Fadderullan',
            'Make friends for life',
        ],
        safety: [
            'BISO HR helps you find a subgroup that fits you',
            'Strengthens your voice in student politics',
            'Reinforces the student voice in academia',
            'Member discounts',
        ],
        location: JSON.stringify({
            address: 'Kong Chr. Frederiks gate 5, 5006 Bergen',
            email: 'president.bergen@biso.no',
        }),
        team: [
            {
                name: 'President',
                role: 'Campus Management BISO Bergen: President',
                imageUrl: '/assets/images/team/bergen-president.jpg',
            },
            {
                name: 'Financial Controller',
                role: 'Campus Management BISO Bergen: Financial Controller',
                imageUrl: '/assets/images/team/bergen-financial.jpg',
            },
            {
                name: 'Head of Academics',
                role: 'Campus Management BISO Bergen – Head of Academics and External Affairs',
                imageUrl: '/assets/images/team/bergen-academics.jpg',
            },
            {
                name: 'Head of Business',
                role: 'Campus Management BISO Bergen – Head of Business Relations',
                imageUrl: '/assets/images/team/bergen-business.jpg',
            },
            {
                name: 'Head of Marketing',
                role: 'Campus Management BISO Bergen – Head of Content, Marketing and PR',
                imageUrl: '/assets/images/team/bergen-marketing.jpg',
            },
            {
                name: 'Head of Projects',
                role: 'Campus Management BISO Bergen: Head of Projects',
                imageUrl: '/assets/images/team/bergen-projects.jpg',
            },
            {
                name: 'Head of Internal Affairs',
                role: 'Campus Management BISO Bergen: Head of Internal Affairs',
                imageUrl: '/assets/images/team/bergen-internal.jpg',
            },
        ],
    }
};

// Data for Trondheim Campus
const trondheimCampusData = {
    campusData: {
        description: 'Get more out of your everyday life with BISO Trondheim!',
        studentBenefits: [
            'Join large and small events',
            'Big discounts in selected stores',
            'Interview coaching with BISO HR',
            'Relevant work experience',
            'Join committees and make friends for life',
        ],
        businessBenefits: [
            'Expose your business and build relationships with BI students',
            'Company presentations',
            'Campus stands at Trondheim',
            'Participation in BISO Trondheim\'s largest events',
            'Professional days and academic events',
        ],
        careerAdvantages: [
            'Free company presentations',
            'Career-specific courses',
            'Relevant work experience',
            'CV portrait with BISO Media',
            'Career Days',
        ],
        socialNetwork: [
            'Join subgroups',
            'Campus events',
            'Participate in Winter Games',
            '40% discount on Fadderullan',
        ],
        safety: [
            'BISO HR helps you find a subgroup that fits you',
            'Strengthens your voice in politics',
            'Reinforces the student voice in academia',
            'Member discounts',
        ],
        location: JSON.stringify({
            address: 'Brattørkaia 16, 7010 Trondheim',
            email: 'president.trondheim@biso.no',
        }),
        team: [
            {
                name: 'Marius Olsen',
                role: 'President',
                imageUrl: '/assets/images/team/trondheim-president.jpg',
            },
            {
                name: 'Marthe Nålsund',
                role: 'Financial Controller',
                imageUrl: '/assets/images/team/trondheim-controller.jpg',
            },
            {
                name: 'Sebastian Reitan',
                role: 'Head of Academics & Sustainability',
                imageUrl: '/assets/images/team/trondheim-academics.jpg',
            },
            {
                name: 'Julie Elise Arnøy',
                role: 'Head of Business Relations',
                imageUrl: '/assets/images/team/trondheim-business.jpg',
            },
            {
                name: 'Mathilde Korneliussen',
                role: 'Head of Marketing & PR',
                imageUrl: '/assets/images/team/trondheim-marketing.jpg',
            },
            {
                name: 'Martin Solheim',
                role: 'Head of Projects',
                imageUrl: '/assets/images/team/trondheim-projects.jpg',
            },
            {
                name: 'Johannes Bergli Breivik',
                role: 'Head of Internal Affairs',
                imageUrl: '/assets/images/team/trondheim-internal.jpg',
            },
            {
                name: 'Kristine Mikkelsen',
                role: 'Head of External Affairs',
                imageUrl: '/assets/images/team/trondheim-external.jpg',
            },
        ],
    }
};

// Data for Stavanger Campus
const stavangerCampusData = {
    campusData: {
        description: 'Maximize your study time with BISO Stavanger',
        studentBenefits: [
            'Company presentations',
            'Interview coaching with BISO HR',
            'Career-specific courses',
            'Relevant work experience',
            'CV portrait with BISO Media',
        ],
        businessBenefits: [
            'Showcase your company to BI students',
            'Campus stands at Stavanger',
            'Participation in major BISO Stavanger events',
            'Professional days and academic events',
            'Building relationships with motivated students',
        ],
        careerAdvantages: [
            'Company presentations',
            'Interview coaching with BISO HR',
            'Career-specific courses',
            'Relevant work experience',
            'CV portrait with BISO Media',
        ],
        socialNetwork: [
            'Join subgroups',
            'Campus events',
            'Participate in Winter Games',
            '40% discount on Fadderullan',
        ],
        safety: [
            'BISO HR helps you find a subgroup that fits you',
            'Strengthens your voice in student politics',
            'Reinforces the student voice in academia',
            'Member discounts',
        ],
        location: JSON.stringify({
            address: 'Byfjordparken 17, 4007 Stavanger',
            email: 'president.stavanger@biso.no',
            phone: '+47 928 21 525',
        }),
        team: [
            {
                name: 'Oliwia Kasprzycka',
                role: 'President',
                imageUrl: '/assets/images/team/stavanger-president.jpg',
            },
            {
                name: 'Joakim Baardsen',
                role: 'Financial Controller',
                imageUrl: '/assets/images/team/stavanger-financial.jpg',
            },
            {
                name: 'Kristian Hordnes Ingebrigtsen',
                role: 'Head of Academics and External Affairs',
                imageUrl: '/assets/images/team/stavanger-academics.jpg',
            },
            {
                name: 'Jostein Baasland',
                role: 'Head of Business Relations',
                imageUrl: '/assets/images/team/stavanger-business.jpg',
            },
            {
                name: 'Oliver Mikael Korkus-Hochheim',
                role: 'Head of Marketing and PR',
                imageUrl: '/assets/images/team/stavanger-marketing.jpg',
            },
            {
                name: 'Julia Becker',
                role: 'Head of Projects',
                imageUrl: '/assets/images/team/stavanger-projects.jpg',
            },
            {
                name: 'Gina Knutsen',
                role: 'Head of Internal Affairs',
                imageUrl: '/assets/images/team/stavanger-internal.jpg',
            },
        ],
    }
};

// Function to create or update the campus data
async function updateCampusData() {
    try {
        // Bergen Campus
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            CAMPUS_IDS.BERGEN,
            bergenCampusData
        );

        // Trondheim Campus
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            CAMPUS_IDS.TRONDHEIM,
            trondheimCampusData
        );

        // Stavanger Campus
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            CAMPUS_IDS.STAVANGER,
            stavangerCampusData
        );
        
    } catch (error) {
        console.error('Error updating campus data:', error);
    }
}

// Execute the update function
updateCampusData();