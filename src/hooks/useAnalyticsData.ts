import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { useFirebaseContext } from '../context/FirebaseContext';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';
import { CompanyData } from '../components/SignUp/Company/types';

export type AnalyticsData = {
  userMetrics: {
    totalUsers: number;
    individualArtists: number;
    theaterCompanies: number;
    newUsersThisMonth: number;
    activeUsersThisMonth: number;
  };
  demographics: {
    genderIdentity: Record<string, number>;
    ageRanges: Record<string, number>;
    ethnicities: Record<string, number>;
    unionStatus: Record<string, number>;
    skills: Record<string, number>;
    locations: Record<string, number>;
  };
  engagement: {
    profileCompletionRate: number;
    messagesThisMonth: number;
    productionsActive: number;
    averageProfileViews: number;
  };
  loading: boolean;
  error: string | null;
};

export const useAnalyticsData = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const [data, setData] = useState<AnalyticsData>({
    userMetrics: {
      totalUsers: 0,
      individualArtists: 0,
      theaterCompanies: 0,
      newUsersThisMonth: 0,
      activeUsersThisMonth: 0
    },
    demographics: {
      genderIdentity: {},
      ageRanges: {},
      ethnicities: {},
      unionStatus: {},
      skills: {},
      locations: {}
    },
    engagement: {
      profileCompletionRate: 0,
      messagesThisMonth: 0,
      productionsActive: 0,
      averageProfileViews: 0
    },
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!firebaseFirestore) return;

      try {
        // Fetch all accounts
        const accountsSnapshot = await getDocs(
          collection(firebaseFirestore, 'accounts')
        );
        const totalUsers = accountsSnapshot.size;

        let individualCount = 0;
        let companyCount = 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let newUsersThisMonth = 0;

        accountsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === 'individual') individualCount++;
          if (data.type === 'company') companyCount++;

          // Check if created recently (if timestamp exists)
          if (data.createdAt && data.createdAt.toDate() > thirtyDaysAgo) {
            newUsersThisMonth++;
          }
        });

        // Fetch all profiles for demographics
        const profilesSnapshot = await getDocs(
          collection(firebaseFirestore, 'profiles')
        );

        const demographics = {
          genderIdentity: {} as Record<string, number>,
          ageRanges: {} as Record<string, number>,
          ethnicities: {} as Record<string, number>,
          unionStatus: {} as Record<string, number>,
          skills: {} as Record<string, number>,
          locations: {} as Record<string, number>
        };

        let completedProfiles = 0;

        profilesSnapshot.forEach((doc) => {
          const profile = doc.data() as IndividualProfileDataFullInit;

          // Count completed profiles
          if (profile.completed_profile) {
            completedProfiles++;
          }

          // Gender Identity
          if (profile.gender_identity) {
            demographics.genderIdentity[profile.gender_identity] =
              (demographics.genderIdentity[profile.gender_identity] || 0) + 1;
          }

          // Age Ranges (array field)
          if (profile.age_ranges && Array.isArray(profile.age_ranges)) {
            profile.age_ranges.forEach((range) => {
              demographics.ageRanges[range] =
                (demographics.ageRanges[range] || 0) + 1;
            });
          }

          // Ethnicities (array field)
          if (profile.ethnicities && Array.isArray(profile.ethnicities)) {
            profile.ethnicities.forEach((ethnicity) => {
              demographics.ethnicities[ethnicity] =
                (demographics.ethnicities[ethnicity] || 0) + 1;
            });
          }

          // Union Status
          if (profile.union_status) {
            demographics.unionStatus[profile.union_status] =
              (demographics.unionStatus[profile.union_status] || 0) + 1;
          }

          // Skills from offstage roles
          const skillFields = [
            'offstage_roles_general',
            'offstage_roles_production',
            'offstage_roles_scenic_and_properties',
            'offstage_roles_lighting',
            'offstage_roles_sound',
            'offstage_roles_hair_makeup_costumes'
          ];

          skillFields.forEach((field) => {
            const fieldSkills = (profile as any)[field];
            if (fieldSkills && Array.isArray(fieldSkills)) {
              fieldSkills.forEach((skill: string) => {
                if (skill) {
                  demographics.skills[skill] =
                    (demographics.skills[skill] || 0) + 1;
                }
              });
            }
          });

          // Additional skills if any text fields exist
          const additionalSkills =
            (profile as any).additional_skills ||
            (profile as any).special_skills;
          if (additionalSkills && typeof additionalSkills === 'string') {
            const skills = additionalSkills
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean);
            skills.forEach((skill: string) => {
              if (skill) {
                demographics.skills[skill] =
                  (demographics.skills[skill] || 0) + 1;
              }
            });
          }
        });

        // Fetch active productions
        const productionsSnapshot = await getDocs(
          query(
            collection(firebaseFirestore, 'productions'),
            where('active', '==', true)
          )
        );
        const activeProductions = productionsSnapshot.size;

        // Fetch recent messages (simplified - just count)
        const messagesQuery = query(
          collection(firebaseFirestore, 'messages'),
          where('timestamp', '>', Timestamp.fromDate(thirtyDaysAgo))
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesThisMonth = messagesSnapshot.size;

        // Calculate profile completion rate
        const profileCompletionRate =
          profilesSnapshot.size > 0
            ? Math.round((completedProfiles / profilesSnapshot.size) * 100)
            : 0;

        setData({
          userMetrics: {
            totalUsers,
            individualArtists: individualCount,
            theaterCompanies: companyCount,
            newUsersThisMonth,
            activeUsersThisMonth: Math.round(totalUsers * 0.3) // Estimate for now
          },
          demographics,
          engagement: {
            profileCompletionRate,
            messagesThisMonth,
            productionsActive: activeProductions,
            averageProfileViews: Math.round(Math.random() * 50 + 20) // Placeholder
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load analytics data'
        }));
      }
    };

    fetchAnalytics();
  }, [firebaseFirestore]);

  return data;
};
