import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatCapsule } from '@/features/new-ui/components/StatCapsule';
import { FeaturedCourseCard } from '@/features/new-ui/components/FeaturedCourseCard';
import { QuestPath } from '@/features/new-ui/components/QuestPath';
import { XpIcon, StreakIcon } from '@/features/new-ui/components/CustomIcons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api.js";
import { isDevQuestToolsEnabled } from "@/lib/devQuest";

export default function QuestScreen() {
  const router = useRouter();
  const questHome = useQuery(api.questProduct.getQuestHome, {});
  const startQuestRun = useMutation(api.questProduct.startQuestRun);
  const devUnlockAllQuestNodes = useMutation(api.questProduct.devUnlockAllQuestNodes);
  const [isUnlockingAll, setIsUnlockingAll] = useState(false);
  const devToolsEnabled = isDevQuestToolsEnabled();

  const handleStartQuest = async (nodeId?: string) => {
    const targetNodeId = nodeId ?? questHome?.activeNode?.id;
    if (!targetNodeId) {
      return;
    }
    const result = await startQuestRun({ nodeId: targetNodeId });
    router.push(`/game/quest/${result.runId}`);
  };

  const handleDevUnlockAll = async () => {
    setIsUnlockingAll(true);
    try {
      await devUnlockAllQuestNodes({});
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not unlock all nodes.";
      Alert.alert(
        "Dev unlock failed",
        `${message}\n\nRun: npx convex env set ALLOW_DEV_QUEST_TOOLS 1`,
      );
    } finally {
      setIsUnlockingAll(false);
    }
  };

  if (!questHome) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />

          <View style={styles.statsContainer}>
            <StatCapsule
              icon={<StreakIcon width={16} height={20} />}
              value={questHome.headerStats.currentStreak}
              color="#FF9600"
            />
            <StatCapsule
              icon={<XpIcon width={16} height={20} />}
              value={`${questHome.headerStats.totalXp} XP`}
              color="#FF9600"
            />
            <StatCapsule
              icon={<Ionicons name="heart" size={20} color="#FF4B4B" />}
              value={questHome.headerStats.hearts}
              color="#FF4B4B"
            />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FeaturedCourseCard
          level={questHome.featuredCourse.level}
          track={questHome.featuredCourse.track}
          title={questHome.featuredCourse.title}
          progress={questHome.featuredCourse.progress}
          onPress={() => handleStartQuest()}
        />

        <QuestPath
          nodes={questHome.nodes.map((node) => ({
            id: node.id,
            status: node.status as any,
            label: node.label,
          }))}
          onNodePress={(nodeId) => {
            const node = questHome.nodes.find((item) => item.id === nodeId);
            if (!node) {
              return;
            }
            if (
              devToolsEnabled ||
              node.status === "current" ||
              node.status === "unlocked" ||
              node.status === "special"
            ) {
              handleStartQuest(nodeId);
            }
          }}
        />

        {devToolsEnabled ? (
          <View style={styles.devBar}>
            <Text style={styles.devLabel}>DEV: tap any node to open it</Text>
            <Pressable
              onPress={handleDevUnlockAll}
              disabled={isUnlockingAll}
              style={({ pressed }) => [
                styles.devUnlockButton,
                (pressed || isUnlockingAll) && styles.devUnlockButtonPressed,
              ]}
            >
              {isUnlockingAll ? (
                <ActivityIndicator color="#FF9600" size="small" />
              ) : (
                <Text style={styles.devUnlockText}>Unlock all</Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {/* Fill space at bottom for scrolling */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
  },
  devBar: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FFF9EE",
    borderWidth: 1,
    borderColor: "#FFE6BF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  devLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#FF9600",
  },
  devUnlockButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE6BF",
    minWidth: 96,
    alignItems: "center",
  },
  devUnlockButtonPressed: {
    opacity: 0.75,
  },
  devUnlockText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF9600",
  },
});
