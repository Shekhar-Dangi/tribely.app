import { View, Text, ScrollView } from "react-native";
import { profile } from "@/constants/styles";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

interface BusinessInfo {
  address?: string;
  phone?: string;
  website?: string;
  operatingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  amenities?: string[];
}

interface MembershipPlan {
  name: string;
  price: number;
  duration: string;
  features: string[];
}

interface Stats {
  memberCount: number;
  trainerCount: number;
  equipmentCount?: number;
}

interface GymDataTabProps {
  bio?: string;
  businessInfo?: BusinessInfo;
  membershipPlans?: MembershipPlan[];
  stats?: Stats;
}

const getDayLabel = (day: string): string => {
  const labels: { [key: string]: string } = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };
  return labels[day] || day;
};

export default function GymDataTab({
  bio,
  businessInfo,
  membershipPlans,
  stats,
}: GymDataTabProps) {
  return (
    <ScrollView style={profile.tabContent} showsVerticalScrollIndicator={false}>
      {bio && (
        <View style={profile.dataCard}>
          <Text style={profile.dataCardTitle}>About</Text>
          <Text style={profile.dataCardDescription}>
            {bio || "Welcome to our gym!"}
          </Text>
        </View>
      )}

      {/* Gym Stats Section */}
      {stats && (
        <View style={profile.statsContainer}>
          <Text style={profile.sectionHeader}>Gym Statistics</Text>
          <View style={profile.statsRow}>
            <View style={profile.statItem}>
              <Text style={profile.statValue}>{stats.memberCount}</Text>
              <Text style={profile.statLabel}>Members</Text>
            </View>
            <View style={profile.statItem}>
              <Text style={profile.statValue}>{stats.trainerCount}</Text>
              <Text style={profile.statLabel}>Trainers</Text>
            </View>
            {stats.equipmentCount && (
              <View style={profile.statItem}>
                <Text style={profile.statValue}>{stats.equipmentCount}</Text>
                <Text style={profile.statLabel}>Equipment</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Business Info Section */}
      {businessInfo && (
        <>
          {businessInfo.address && (
            <View
              style={[
                profile.dataCard,
                { flexDirection: "row", alignItems: "flex-start" },
              ]}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.background,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={COLORS.error}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>Address</Text>
                <Text style={profile.dataCardDescription}>
                  {businessInfo.address}
                </Text>
              </View>
            </View>
          )}

          {businessInfo.phone && (
            <View
              style={[
                profile.dataCard,
                { flexDirection: "row", alignItems: "flex-start" },
              ]}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.background,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="call" size={20} color={COLORS.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>Phone</Text>
                <Text style={profile.dataCardDescription}>
                  {businessInfo.phone}
                </Text>
              </View>
            </View>
          )}

          {businessInfo.website && (
            <View
              style={[
                profile.dataCard,
                { flexDirection: "row", alignItems: "flex-start" },
              ]}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.background,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="globe" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>Website</Text>
                <Text style={profile.dataCardDescription}>
                  {businessInfo.website}
                </Text>
              </View>
            </View>
          )}

          {/* Operating Hours */}
          {businessInfo.operatingHours && (
            <View style={profile.dataCard}>
              <Text style={profile.dataCardTitle}>Operating Hours</Text>
              {Object.entries(businessInfo.operatingHours).map(
                ([day, hours]) =>
                  hours ? (
                    <View
                      key={day}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: 4,
                      }}
                    >
                      <Text style={profile.dataCardSubtitle}>
                        {getDayLabel(day)}
                      </Text>
                      <Text style={profile.dataCardDescription}>{hours}</Text>
                    </View>
                  ) : null
              )}
            </View>
          )}

          {/* Amenities */}
          {businessInfo.amenities && businessInfo.amenities.length > 0 && (
            <View
              style={[
                profile.dataCard,
                { flexDirection: "row", alignItems: "flex-start" },
              ]}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.background,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <FontAwesome5 name="list" size={20} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>Amenities</Text>
                <Text style={profile.dataCardDescription}>
                  {businessInfo.amenities.join(", ")}
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      {/* Membership Plans Section */}
      {membershipPlans && membershipPlans.length > 0 && (
        <>
          <Text style={profile.sectionHeader}>Membership Plans</Text>
          {membershipPlans.map((plan, index) => (
            <View
              key={index}
              style={[
                profile.dataCard,
                { flexDirection: "row", alignItems: "flex-start" },
              ]}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.background,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <MaterialIcons
                  name="card-membership"
                  size={20}
                  color={COLORS.premium}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>{plan.name}</Text>
                <Text style={profile.dataCardSubtitle}>
                  ${plan.price} • {plan.duration}
                </Text>
                {plan.features && plan.features.length > 0 && (
                  <Text style={profile.dataCardDescription}>
                    {plan.features.join(" • ")}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Empty State */}
      {!bio && !businessInfo && !membershipPlans?.length && !stats && (
        <Text style={profile.contentPlaceholder}>
          No profile data available yet
        </Text>
      )}
    </ScrollView>
  );
}
