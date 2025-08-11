import { View, Text, ScrollView } from "react-native";
import { profile } from "@/constants/styles";
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

interface Stats {
  height: number;
  weight: number;
  bodyFat?: number;
  personalRecords?: {
    exerciseName: string;
    subtitle: string;
    date: number;
  }[];
}

interface Experience {
  title: string;
  subtitle?: string;
  description?: string;
  startDate: number;
  endDate?: number;
  isCurrent: boolean;
}

interface Certification {
  title: string;
  subtitle?: string;
  description?: string;
  issueDate: number;
  expiryDate?: number;
  credentialId?: string;
  isActive: boolean;
}

interface DataTabProps {
  bio?: string;
  stats?: Stats;
  experiences?: Experience[];
  certifications?: Certification[];
  affiliation?: string;
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export default function DataTab({
  bio,
  stats,
  experiences,
  certifications,
  affiliation,
}: DataTabProps) {
  return (
    <ScrollView style={profile.tabContent} showsVerticalScrollIndicator={false}>
      {bio && (
        <View style={profile.dataCard}>
          <Text style={profile.dataCardTitle}>About</Text>
          <Text style={profile.dataCardDescription}>
            {bio || "well, go and set your bio bro!"}
          </Text>
        </View>
      )}

      {/* Stats Section */}
      {stats && (
        <View style={profile.dataCard}>
          <Text style={profile.sectionHeader}>Physical Stats</Text>
          <View style={profile.statsRow}>
            <View style={profile.statItem}>
              <Text style={profile.statValue}>{stats.height}cm</Text>
              <Text style={profile.statLabel}>Height</Text>
            </View>
            <View style={profile.statItem}>
              <Text style={profile.statValue}>{stats.weight}kg</Text>
              <Text style={profile.statLabel}>Weight</Text>
            </View>
            {stats.bodyFat && (
              <View style={profile.statItem}>
                <Text style={profile.statValue}>{stats.bodyFat}%</Text>
                <Text style={profile.statLabel}>Body Fat</Text>
              </View>
            )}
          </View>

          {/* Personal Records */}
          {stats.personalRecords && stats.personalRecords.length > 0 && (
            <>
              <Text style={profile.sectionHeader}>Personal Records</Text>
              {stats.personalRecords.map((record, index) => (
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
                    <FontAwesome5
                      name="trophy"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={profile.dataCardTitle}>
                      {record.exerciseName}
                    </Text>
                    <Text style={profile.dataCardSubtitle}>
                      {record.subtitle}
                    </Text>
                    <Text style={profile.dataCardDate}>
                      Achieved: {formatDate(record.date)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Experiences Section */}
      {experiences && experiences.length > 0 && (
        <>
          <Text style={profile.sectionHeader}>Experience</Text>
          {experiences.map((experience, index) => (
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
                <Ionicons name="briefcase" size={20} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>{experience.title}</Text>
                {experience.subtitle && (
                  <Text style={profile.dataCardSubtitle}>
                    {experience.subtitle}
                  </Text>
                )}
                {experience.description && (
                  <Text style={profile.dataCardDescription}>
                    {experience.description}
                  </Text>
                )}
                <Text style={profile.dataCardDate}>
                  {formatDate(experience.startDate)} -{" "}
                  {experience.isCurrent
                    ? "Present"
                    : experience.endDate
                      ? formatDate(experience.endDate)
                      : "Unknown"}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && (
        <>
          <Text style={profile.sectionHeader}>Certifications</Text>
          {certifications.map((cert, index) => (
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
                <MaterialIcons name="school" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profile.dataCardTitle}>{cert.title}</Text>
                {cert.subtitle && (
                  <Text style={profile.dataCardSubtitle}>{cert.subtitle}</Text>
                )}
                {cert.description && (
                  <Text style={profile.dataCardDescription}>
                    {cert.description}
                  </Text>
                )}
                {/* {cert.credentialId && (
                  <Text style={profile.dataCardDescription}>
                    ID: {cert.credentialId}
                  </Text>
                )} */}
                <Text style={profile.dataCardDate}>
                  Issued: {formatDate(cert.issueDate)}
                  {!cert.isActive &&
                    cert.expiryDate &&
                    ` • Expires: ${formatDate(cert.expiryDate)}`}
                </Text>
                {/* {cert.isActive && (
                  <View style={profile.activeBadge}>
                    <Text style={profile.activeBadgeText}>Active</Text>
                  </View>
                )} */}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Affiliation */}
      {affiliation && (
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
            <AntDesign name="team" size={20} color={COLORS.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={profile.dataCardTitle}>Affiliation</Text>
            <Text style={profile.dataCardDescription}>{affiliation}</Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!bio &&
        !stats &&
        !experiences?.length &&
        !certifications?.length &&
        !affiliation && (
          <Text style={profile.contentPlaceholder}>
            No profile data available yet
          </Text>
        )}
    </ScrollView>
  );
}
