class ReadinessScorer:
    def __init__(self):
        self.weights = {
            'arrays': 0.15, 'strings': 0.10, 'trees': 0.15,
            'graphs': 0.12, 'dp': 0.15, 'linked_lists': 0.10,
            'recursion': 0.08, 'sorting': 0.07,
            'searching': 0.05, 'stack_queue': 0.03
        }

    def calculate(self, all_topic_mastery):
        """
        all_topic_mastery: dict mapping topic_name (lowercase, as in weights) to mastery_score (0-100).
        Returns readiness score, level, topic contributions, missing topics, estimated days, top priority.
        """
        contributions = {}
        weighted_sum = 0.0
        total_weight = 0.0
        missing_topics = []

        for topic, weight in self.weights.items():
            total_weight += weight
            score = all_topic_mastery.get(topic, 0)
            if score == 0:
                missing_topics.append(topic)
            contrib = score * weight
            contributions[topic] = round(contrib, 2)
            weighted_sum += contrib

        readiness_score = round(weighted_sum / total_weight) if total_weight > 0 else 0

        # Readiness level
        if readiness_score >= 80:
            level = 'Placement Ready'
        elif readiness_score >= 60:
            level = 'Interview Practicing'
        elif readiness_score >= 40:
            level = 'Foundation Building'
        else:
            level = 'Beginner'

        # Estimated days to ready (simple linear mapping)
        days_to_ready = max(0, int((80 - readiness_score) * 0.3)) if readiness_score < 80 else 0

        # Top priority: highest weight among missing/weak topics
        top_priority = None
        max_weight = -1
        for topic in missing_topics:
            if self.weights[topic] > max_weight:
                max_weight = self.weights[topic]
                top_priority = topic
        if not top_priority:
            # pick the topic with lowest contribution
            sorted_topics = sorted(contributions.items(), key=lambda x: x[1])
            top_priority = sorted_topics[0][0] if sorted_topics else None

        return {
            'readiness_score': readiness_score,
            'readiness_level': level,
            'topic_contributions': contributions,
            'missing_topics': missing_topics,
            'estimated_days_to_ready': days_to_ready,
            'top_priority': top_priority
        }