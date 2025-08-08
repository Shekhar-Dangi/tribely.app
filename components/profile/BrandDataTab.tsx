import { View, Text, ScrollView } from "react-native";
import { profile } from "@/constants/styles";
import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

interface BusinessInfo {
  companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "501+";
  industry?: string;
  website?: string;
  headquarters?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

interface Partnership {
  partnerName: string;
  partnerType: "gym" | "individual" | "brand";
  partnership_type: string;
  startDate: number;
  endDate?: number;
  isActive: boolean;
}

interface BrandDataTabProps {
  bio?: string;
  businessInfo?: BusinessInfo;
  partnerships?: Partnership[];
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const getPartnerTypeIcon = (type: string) => {
  switch (type) {
    case "gym": return "fitness";
    case "individual": return "person";
    case "brand": return "business";
    default: return "help";
  }
};

export default function BrandDataTab({
  bio,
  businessInfo,
  partnerships,
}: BrandDataTabProps) {
  return (
    <ScrollView style={profile.tabContent} showsVerticalScrollIndicator={false}>
      {bio && (
        <View style={profile.dataCard}>
          <Text style={profile.dataCardTitle}>About</Text>
          <Text style={profile.dataCardDescription}>
            {bio || "Tell us about your brand!"}
          </Text>
        </View>
      )}

      {/* Business Info Section */}
      {businessInfo && (
        <View style={profile.statsContainer}>
          <Text style={profile.sectionHeader}>Business Information</Text>
          
          {businessInfo.industry && (
            <View style={profile.statsRow}>
              <View style={profile.statItem}>
                <Text style={profile.statValue}>{businessInfo.industry}</Text>
                <Text style={profile.statLabel}>Industry</Text>
              </View>
              {businessInfo.companySize && (
                <View style={profile.statItem}>
                  <Text style={profile.statValue}>{businessInfo.companySize}</Text>
                  <Text style={profile.statLabel}>Company Size</Text>
                </View>
              )}
            </View>
          )}

          {businessInfo.headquarters && (
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
                <Ionicons name="location" size={20} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>Headquarters</Text>
                <Text style={profile.dataCardDescription}>
                  {businessInfo.headquarters}
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

          {businessInfo.contactInfo && (
            <>
              {businessInfo.contactInfo.phone && (
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
                      {businessInfo.contactInfo.phone}
                    </Text>
                  </View>
                </View>
              )}

              {businessInfo.contactInfo.email && (
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
                    <Ionicons name="mail" size={20} color={COLORS.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={profile.dataCardTitle}>Email</Text>
                    <Text style={profile.dataCardDescription}>
                      {businessInfo.contactInfo.email}
                    </Text>
                  </View>
                </View>
              )}

              {businessInfo.contactInfo.address && (
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
                    <MaterialIcons name="location-on" size={20} color={COLORS.error} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={profile.dataCardTitle}>Address</Text>
                    <Text style={profile.dataCardDescription}>
                      {businessInfo.contactInfo.address}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Partnerships Section */}
      {partnerships && partnerships.length > 0 && (
        <>
          <Text style={profile.sectionHeader}>Partnerships</Text>
          {partnerships.map((partnership, index) => (
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
                <Ionicons 
                  name={getPartnerTypeIcon(partnership.partnerType)} 
                  size={20} 
                  color={COLORS.secondary} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>{partnership.partnerName}</Text>
                <Text style={profile.dataCardSubtitle}>
                  {partnership.partnership_type} • {partnership.partnerType}
                </Text>
                <Text style={profile.dataCardDate}>
                  {formatDate(partnership.startDate)} -{" "}
                  {partnership.isActive
                    ? "Present"
                    : partnership.endDate
                      ? formatDate(partnership.endDate)
                      : "Unknown"}
                </Text>
                {partnership.isActive && (
                  <View style={profile.activeBadge}>
                    <Text style={profile.activeBadgeText}>Active</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Empty State */}
      {!bio && !businessInfo && !partnerships?.length && (
        <Text style={profile.contentPlaceholder}>
          No profile data available yet
        </Text>
      )}
    </ScrollView>
  );
}
