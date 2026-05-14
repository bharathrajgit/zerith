"""
weak_area_detector.py
Hybrid approach: rule-based logic + severity scoring.
More reliable than pure ML for structured DSA data.
"""

import numpy as np


class WeakAreaDetector:

    # Interview frequency weights (same as readiness)
    TOPIC_WEIGHTS = {
        'arrays':       0.15,
        'strings':      0.10,
        'trees':        0.15,
        'graphs':       0.12,
        'dp':           0.15,
        'linked_lists': 0.10,
        'recursion':    0.08,
        'sorting':      0.07,
        'searching':    0.05,
        'stack_queue':  0.03,
    }

    RECOMMENDATIONS = {
        'conceptual_gap': {
            'message': (
                'Your basic understanding of this topic '
                'needs strengthening. Re-watch the concept '
                'video and redo Basic MCQs.'
            ),
            'action': 'Restart from Basic MCQ round',
        },
        'application_gap': {
            'message': (
                'You understand the concept but struggle '
                'to apply it. Focus on Medium MCQs and '
                'trace through Java code examples.'
            ),
            'action': 'Practice Medium MCQs + code tracing',
        },
        'reasoning_gap': {
            'message': (
                'You can apply the concept but struggle '
                'with complex reasoning. Practice Hard '
                'MCQs and LeetCode Medium problems.'
            ),
            'action': 'Practice Hard MCQs + LeetCode Medium',
        },
        'hint_dependent': {
            'message': (
                'You rely heavily on hints. Try solving '
                'problems without hints for 3 days to '
                'build independent thinking.'
            ),
            'action': 'No-hint challenge for 3 days',
        },
        'repeated_failure': {
            'message': (
                'You have struggled with this topic '
                'multiple times. Consider a different '
                'learning resource or approach.'
            ),
            'action': 'Try alternative video + fresh start',
        },
    }

    def detect(self, topic_list):
        """
        Analyze performance across all topics.

        Input: list of dicts:
        [{
            topic_name: str,
            round1_acc: float (0-1),
            round2_acc: float (0-1),
            round3_acc: float (0-1),
            attempt_count: int,
            hint_rate: float (0-1)
        }]

        Returns: comprehensive weak area analysis
        """
        weak_topics  = []
        strong_topics = []
        total_weight_covered = 0
        weighted_strength    = 0

        for topic_data in topic_list:
            name      = topic_data['topic_name'].lower()
            r1        = float(topic_data['round1_acc'])
            r2        = float(topic_data['round2_acc'])
            r3        = float(topic_data['round3_acc'])
            attempts  = int(topic_data['attempt_count'])
            hint_rate = float(topic_data['hint_rate'])

            # ── Determine weak type ───────────────────
            weak_type  = None
            flags      = []
            severity   = None

            if r1 < 0.60:
                weak_type = 'conceptual_gap'
                severity  = (
                    'high' if r1 < 0.40 else 'medium'
                )
            elif r2 < 0.60:
                weak_type = 'application_gap'
                severity  = (
                    'high' if r2 < 0.40 else 'medium'
                )
            elif r3 < 0.60:
                weak_type = 'reasoning_gap'
                severity  = 'low'

            if hint_rate > 0.60:
                flags.append('hint_dependent')

            if attempts >= 3:
                flags.append('repeated_failure')
                if severity in (None, 'low'):
                    severity = 'medium'

            # ── Overall topic score ───────────────────
            # Weighted across all 3 rounds
            topic_score = (
                r1 * 0.25 +
                r2 * 0.35 +
                r3 * 0.40
            )

            # ── Interview weight for this topic ───────
            interview_weight = self.TOPIC_WEIGHTS.get(
                name, 0.05
            )
            total_weight_covered += interview_weight
            weighted_strength    += (
                topic_score * interview_weight
            )

            # ── Priority score (for ordering) ─────────
            # Higher = fix this first
            priority = self._calculate_priority(
                weak_type, severity,
                interview_weight, topic_score
            )

            if weak_type or flags:
                # Build recommendation
                rec_key = weak_type or flags[0]
                rec     = self.RECOMMENDATIONS.get(
                    rec_key, {}
                )

                weak_topics.append({
                    'topic_name':     topic_data['topic_name'],
                    'weak_type':      weak_type,
                    'severity':       severity or 'low',
                    'flags':          flags,
                    'topic_score':    round(topic_score * 100, 1),
                    'round_scores': {
                        'basic':  round(r1 * 100, 1),
                        'medium': round(r2 * 100, 1),
                        'hard':   round(r3 * 100, 1),
                    },
                    'interview_weight': interview_weight,
                    'priority':         priority,
                    'recommendation':   rec.get('message', ''),
                    'action':           rec.get('action', ''),
                })
            else:
                strong_topics.append({
                    'topic_name':  topic_data['topic_name'],
                    'topic_score': round(topic_score * 100, 1),
                })

        # ── Sort weak topics by priority ──────────────
        weak_topics.sort(
            key=lambda x: x['priority'], reverse=True
        )

        # ── Overall weakness score (0-100) ────────────
        if total_weight_covered > 0:
            overall_strength = (
                weighted_strength / total_weight_covered
            ) * 100
        else:
            overall_strength = 0

        overall_weakness = max(0, 100 - overall_strength)

        # ── Action plan ───────────────────────────────
        action_plan = self._generate_action_plan(
            weak_topics, overall_weakness
        )

        return {
            'weak_topics':            weak_topics,
            'strong_topics':          strong_topics,
            'overall_weakness_score': round(
                overall_weakness, 1
            ),
            'topics_analyzed':        len(topic_list),
            'weak_count':             len(weak_topics),
            'strong_count':           len(strong_topics),
            'action_plan':            action_plan,
            'top_priority_topic': (
                weak_topics[0]['topic_name']
                if weak_topics else None
            ),
        }

    def _calculate_priority(
        self, weak_type, severity,
        interview_weight, topic_score
    ):
        """
        Priority = interview importance × weakness depth
        Higher score = should fix first
        """
        base = interview_weight * 100

        severity_mult = {
            'high':   3.0,
            'medium': 2.0,
            'low':    1.0,
            None:     0.5,
        }
        mult = severity_mult.get(severity, 1.0)

        weakness_depth = 1 - topic_score

        return round(base * mult * weakness_depth, 3)

    def _generate_action_plan(
        self, weak_topics, overall_weakness
    ):
        if not weak_topics:
            return (
                'Excellent! No weak areas detected. '
                'Continue with Hard MCQs and LeetCode '
                'Medium problems to maintain readiness.'
            )

        top = weak_topics[0]

        if overall_weakness > 60:
            return (
                f'Critical: Start with '
                f'{top["topic_name"]} immediately. '
                f'Your foundation needs significant '
                f'strengthening before advancing.'
            )
        elif overall_weakness > 35:
            return (
                f'Focus on {top["topic_name"]} this week. '
                f'Dedicate 2 extra sessions to '
                f'{top["action"]}.'
            )
        else:
            return (
                f'Minor gaps in {top["topic_name"]}. '
                f'One targeted session should resolve it: '
                f'{top["action"]}.'
            )