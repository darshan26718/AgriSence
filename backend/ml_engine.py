"""
ml_engine.py - Pure-Python Machine Learning Engine for AgriSense
Zero external dependencies. Implements Decision Trees, Random Forest,
Gradient Boosting, and Ensemble Voting for multi-class classification.

Designed for the AgriSense feature space (10-12 features, 20-27 classes).
"""

import math
import json
import random
from typing import Dict, Any, List, Tuple, Optional


# ---------------------------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------------------------

def gini_impurity(groups: List[List[int]], classes: List[int]) -> float:
    """Calculates Gini impurity for a split."""
    total = sum(len(g) for g in groups)
    if total == 0:
        return 1.0
    gini = 0.0
    for group in groups:
        size = len(group)
        if size == 0:
            continue
        score = 0.0
        for cls in classes:
            proportion = group.count(cls) / size
            score += proportion * proportion
        gini += (1.0 - score) * (size / total)
    return gini


def bootstrap_sample(X: List[List[float]], y: List[int], rng: random.Random) -> Tuple[List[List[float]], List[int]]:
    """Creates a bootstrap sample (sampling with replacement)."""
    n = len(X)
    indices = [rng.randint(0, n - 1) for _ in range(n)]
    return [X[i] for i in indices], [y[i] for i in indices]


def majority_vote(labels: List[int]) -> int:
    """Returns the most common label."""
    counts: Dict[int, int] = {}
    for lbl in labels:
        counts[lbl] = counts.get(lbl, 0) + 1
    return max(counts, key=lambda k: counts[k])


# ---------------------------------------------------------------------------
# Decision Tree (CART with Gini Impurity)
# ---------------------------------------------------------------------------

class TreeNode:
    """A node in a decision tree."""
    __slots__ = ['feature_idx', 'threshold', 'left', 'right', 'value']

    def __init__(self):
        self.feature_idx: int = -1
        self.threshold: float = 0.0
        self.left: Optional['TreeNode'] = None
        self.right: Optional['TreeNode'] = None
        self.value: Optional[int] = None  # Leaf class label


class DecisionTree:
    """
    CART Decision Tree classifier with Gini impurity splitting.
    Supports max_depth, min_samples_split, and random feature subsampling.
    """

    def __init__(
        self,
        max_depth: int = 12,
        min_samples_split: int = 5,
        max_features: Optional[int] = None,
        seed: int = 42,
    ):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.root: Optional[TreeNode] = None
        self.classes_: List[int] = []
        self.n_features_: int = 0
        self.rng = random.Random(seed)

    def fit(self, X: List[List[float]], y: List[int]):
        self.classes_ = sorted(set(y))
        self.n_features_ = len(X[0]) if X else 0
        if self.max_features is None:
            self.max_features = self.n_features_
        self.root = self._build_tree(X, y, depth=0)

    def predict(self, X: List[List[float]]) -> List[int]:
        return [self._predict_single(self.root, row) for row in X]

    def predict_proba(self, X: List[List[float]]) -> List[Dict[int, float]]:
        """Predicts class probabilities (returns 1.0 for predicted class, 0 for others)."""
        preds = self.predict(X)
        result = []
        for p in preds:
            proba = {c: 0.0 for c in self.classes_}
            proba[p] = 1.0
            result.append(proba)
        return result

    def _predict_single(self, node: Optional[TreeNode], row: List[float]) -> int:
        if node is None:
            return self.classes_[0] if self.classes_ else 0
        if node.value is not None:
            return node.value
        if row[node.feature_idx] <= node.threshold:
            return self._predict_single(node.left, row)
        else:
            return self._predict_single(node.right, row)

    def _build_tree(self, X: List[List[float]], y: List[int], depth: int) -> TreeNode:
        node = TreeNode()

        # Stopping conditions
        if depth >= self.max_depth or len(y) < self.min_samples_split or len(set(y)) == 1:
            node.value = majority_vote(y) if y else (self.classes_[0] if self.classes_ else 0)
            return node

        # Find best split
        best_gini = float('inf')
        best_feat = -1
        best_thresh = 0.0
        best_left_idx: List[int] = []
        best_right_idx: List[int] = []

        # Random feature subsampling
        n_feats = len(X[0]) if X else 0
        n_samples = len(y)
        feat_indices = list(range(n_feats))
        if self.max_features and self.max_features < n_feats:
            feat_indices = self.rng.sample(feat_indices, self.max_features)

        # Pre-compute class counts for the full node
        class_count_total: Dict[int, int] = {}
        for lbl in y:
            class_count_total[lbl] = class_count_total.get(lbl, 0) + 1

        for feat_idx in feat_indices:
            # Sort indices by feature value for efficient threshold sweep
            sorted_indices = sorted(range(n_samples), key=lambda i: X[i][feat_idx])

            # Sweep thresholds using O(1) cumulative sum-of-squares class counts
            left_counts: Dict[int, int] = {}
            right_counts = dict(class_count_total)
            left_sum_sq = 0
            right_sum_sq = sum(v * v for v in class_count_total.values())
            left_size = 0

            for pos in range(n_samples - 1):
                idx = sorted_indices[pos]
                lbl = y[idx]
                old_l = left_counts.get(lbl, 0)
                left_counts[lbl] = old_l + 1
                left_sum_sq += 2 * old_l + 1

                old_r = right_counts[lbl]
                right_counts[lbl] = old_r - 1
                right_sum_sq -= 2 * old_r - 1

                left_size += 1
                right_size = n_samples - left_size

                cur_val = X[idx][feat_idx]
                next_val = X[sorted_indices[pos + 1]][feat_idx]

                # Only evaluate at boundaries where feature value changes
                if cur_val == next_val:
                    continue

                # Skip intermediate thresholds for large nodes for fast convergence
                if n_samples > 300 and pos % 2 != 0:
                    continue

                # O(1) Gini impurity computation
                left_gini = 1.0 - left_sum_sq / (left_size * left_size)
                right_gini = 1.0 - right_sum_sq / (right_size * right_size)
                weighted_gini = (left_size * left_gini + right_size * right_gini) / n_samples

                if weighted_gini < best_gini:
                    best_gini = weighted_gini
                    best_feat = feat_idx
                    best_thresh = (cur_val + next_val) / 2.0
                    # Defer building index lists until we know the final best split

        if best_feat == -1:
            node.value = majority_vote(y) if y else (self.classes_[0] if self.classes_ else 0)
            return node

        # Build index lists only for the winning split
        best_left_idx = [i for i in range(n_samples) if X[i][best_feat] <= best_thresh]
        best_right_idx = [i for i in range(n_samples) if X[i][best_feat] > best_thresh]

        if not best_left_idx or not best_right_idx:
            node.value = majority_vote(y) if y else (self.classes_[0] if self.classes_ else 0)
            return node

        node.feature_idx = best_feat
        node.threshold = best_thresh
        node.left = self._build_tree(
            [X[i] for i in best_left_idx],
            [y[i] for i in best_left_idx],
            depth + 1,
        )
        node.right = self._build_tree(
            [X[i] for i in best_right_idx],
            [y[i] for i in best_right_idx],
            depth + 1,
        )
        return node

    def to_dict(self) -> Dict[str, Any]:
        return {
            "max_depth": self.max_depth,
            "min_samples_split": self.min_samples_split,
            "max_features": self.max_features,
            "classes": self.classes_,
            "n_features": self.n_features_,
            "tree": self._node_to_dict(self.root),
        }

    def _node_to_dict(self, node: Optional[TreeNode]) -> Optional[Dict[str, Any]]:
        if node is None:
            return None
        if node.value is not None:
            return {"v": node.value}
        return {
            "f": node.feature_idx,
            "t": round(node.threshold, 6),
            "l": self._node_to_dict(node.left),
            "r": self._node_to_dict(node.right),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DecisionTree':
        tree = cls(
            max_depth=data.get("max_depth", 12),
            min_samples_split=data.get("min_samples_split", 5),
            max_features=data.get("max_features"),
        )
        tree.classes_ = data.get("classes", [])
        tree.n_features_ = data.get("n_features", 0)
        tree.root = tree._dict_to_node(data.get("tree"))
        return tree

    def _dict_to_node(self, data: Optional[Dict[str, Any]]) -> Optional[TreeNode]:
        if data is None:
            return None
        node = TreeNode()
        if "v" in data:
            node.value = data["v"]
            return node
        node.feature_idx = data["f"]
        node.threshold = data["t"]
        node.left = self._dict_to_node(data.get("l"))
        node.right = self._dict_to_node(data.get("r"))
        return node


# ---------------------------------------------------------------------------
# Random Forest
# ---------------------------------------------------------------------------

class RandomForest:
    """
    Random Forest classifier: ensemble of decision trees with bootstrap sampling
    and random feature subsets at each split.
    """

    def __init__(
        self,
        n_trees: int = 50,
        max_depth: int = 12,
        min_samples_split: int = 5,
        max_features_ratio: float = 0.7,
        seed: int = 42,
    ):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features_ratio = max_features_ratio
        self.seed = seed
        self.trees: List[DecisionTree] = []
        self.classes_: List[int] = []

    def fit(self, X: List[List[float]], y: List[int], verbose: bool = False):
        self.classes_ = sorted(set(y))
        n_features = len(X[0]) if X else 0
        max_feats = max(1, int(n_features * self.max_features_ratio))
        rng = random.Random(self.seed)

        self.trees = []
        for i in range(self.n_trees):
            tree_seed = rng.randint(0, 2**31)
            X_boot, y_boot = bootstrap_sample(X, y, random.Random(tree_seed))
            tree = DecisionTree(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                max_features=max_feats,
                seed=tree_seed,
            )
            tree.fit(X_boot, y_boot)
            self.trees.append(tree)
            if verbose and (i + 1) % 10 == 0:
                print(f"  [RF] Trained tree {i + 1}/{self.n_trees}")

    def predict(self, X: List[List[float]]) -> List[int]:
        if not self.trees:
            return [0] * len(X)
        # Collect votes from all trees
        all_preds = [tree.predict(X) for tree in self.trees]
        results = []
        for sample_idx in range(len(X)):
            votes = [all_preds[tree_idx][sample_idx] for tree_idx in range(len(self.trees))]
            results.append(majority_vote(votes))
        return results

    def predict_proba(self, X: List[List[float]]) -> List[Dict[int, float]]:
        """Predicts class probabilities by averaging votes across trees."""
        if not self.trees:
            return [{c: 1.0 / len(self.classes_) for c in self.classes_} for _ in X]

        all_preds = [tree.predict(X) for tree in self.trees]
        results = []
        n_trees = len(self.trees)

        for sample_idx in range(len(X)):
            counts: Dict[int, int] = {c: 0 for c in self.classes_}
            for tree_idx in range(n_trees):
                pred = all_preds[tree_idx][sample_idx]
                counts[pred] = counts.get(pred, 0) + 1
            proba = {c: counts.get(c, 0) / n_trees for c in self.classes_}
            results.append(proba)
        return results

    def to_dict(self) -> Dict[str, Any]:
        return {
            "n_trees": self.n_trees,
            "max_depth": self.max_depth,
            "min_samples_split": self.min_samples_split,
            "max_features_ratio": self.max_features_ratio,
            "seed": self.seed,
            "classes": self.classes_,
            "trees": [t.to_dict() for t in self.trees],
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RandomForest':
        rf = cls(
            n_trees=data.get("n_trees", 50),
            max_depth=data.get("max_depth", 12),
            min_samples_split=data.get("min_samples_split", 5),
            max_features_ratio=data.get("max_features_ratio", 0.7),
            seed=data.get("seed", 42),
        )
        rf.classes_ = data.get("classes", [])
        rf.trees = [DecisionTree.from_dict(td) for td in data.get("trees", [])]
        return rf


# ---------------------------------------------------------------------------
# Gradient Boosting Classifier (Multi-class via One-vs-Rest stumps)
# ---------------------------------------------------------------------------

class GradientBoostingClassifier:
    """
    Gradient Boosting for multi-class classification using one-vs-rest
    strategy with shallow decision tree regressors (stumps/depth-3 trees).
    Uses softmax cross-entropy loss.
    """

    def __init__(
        self,
        n_estimators: int = 40,
        learning_rate: float = 0.1,
        max_depth: int = 4,
        seed: int = 42,
    ):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.seed = seed
        self.classes_: List[int] = []
        # For each class, store a list of regression trees (as dicts of node splits)
        self.boosted_trees: Dict[int, List[Dict[str, Any]]] = {}
        self.initial_log_odds: Dict[int, float] = {}

    def fit(self, X: List[List[float]], y: List[int], verbose: bool = False):
        self.classes_ = sorted(set(y))
        n_samples = len(X)
        n_classes = len(self.classes_)
        rng = random.Random(self.seed)

        # Initialize with log-prior probabilities
        class_counts = {c: 0 for c in self.classes_}
        for label in y:
            class_counts[label] += 1

        for c in self.classes_:
            self.initial_log_odds[c] = math.log(max(class_counts[c], 1) / n_samples)
            self.boosted_trees[c] = []

        # Current raw predictions (F values) for each sample, each class
        F: Dict[int, List[float]] = {}
        for c in self.classes_:
            F[c] = [self.initial_log_odds[c]] * n_samples

        for iteration in range(self.n_estimators):
            # Compute softmax probabilities
            probas = self._softmax_matrix(F, n_samples)

            for cls_idx, c in enumerate(self.classes_):
                # Compute negative gradient (residuals)
                residuals = []
                for i in range(n_samples):
                    target = 1.0 if y[i] == c else 0.0
                    residuals.append(target - probas[i][cls_idx])

                # Fit a shallow regression tree to the residuals
                tree = self._fit_regression_tree(X, residuals, rng)
                self.boosted_trees[c].append(tree)

                # Update F values
                predictions = self._predict_regression_tree(tree, X)
                for i in range(n_samples):
                    F[c][i] += self.learning_rate * predictions[i]

            if verbose and (iteration + 1) % 10 == 0:
                # Compute training accuracy
                correct = 0
                for i in range(n_samples):
                    best_c = max(self.classes_, key=lambda c: F[c][i])
                    if best_c == y[i]:
                        correct += 1
                acc = correct / n_samples * 100
                print(f"  [GBM] Iteration {iteration + 1}/{self.n_estimators} — Train Acc: {acc:.1f}%")

    def predict(self, X: List[List[float]]) -> List[int]:
        proba = self.predict_proba(X)
        return [max(p, key=lambda c: p[c]) for p in proba]

    def predict_proba(self, X: List[List[float]]) -> List[Dict[int, float]]:
        n_samples = len(X)
        F: Dict[int, List[float]] = {}

        for c in self.classes_:
            F[c] = [self.initial_log_odds.get(c, 0.0)] * n_samples
            for tree in self.boosted_trees.get(c, []):
                preds = self._predict_regression_tree(tree, X)
                for i in range(n_samples):
                    F[c][i] += self.learning_rate * preds[i]

        probas_raw = self._softmax_matrix(F, n_samples)
        results = []
        for i in range(n_samples):
            results.append({c: probas_raw[i][cls_idx] for cls_idx, c in enumerate(self.classes_)})
        return results

    def _softmax_matrix(self, F: Dict[int, List[float]], n_samples: int) -> List[List[float]]:
        """Compute softmax probabilities for each sample across classes."""
        probas = []
        for i in range(n_samples):
            raw = [F[c][i] for c in self.classes_]
            max_raw = max(raw)
            exp_vals = [math.exp(min(50.0, r - max_raw)) for r in raw]
            total = sum(exp_vals)
            probas.append([e / (total + 1e-12) for e in exp_vals])
        return probas

    def _fit_regression_tree(
        self,
        X: List[List[float]],
        residuals: List[float],
        rng: random.Random,
    ) -> Dict[str, Any]:
        """Fits a shallow regression tree to residuals."""
        return self._build_reg_node(X, residuals, depth=0, rng=rng)

    def _build_reg_node(
        self,
        X: List[List[float]],
        residuals: List[float],
        depth: int,
        rng: random.Random,
    ) -> Dict[str, Any]:
        n = len(residuals)
        if n == 0:
            return {"v": 0.0}

        mean_r = sum(residuals) / n

        if depth >= self.max_depth or n < 10:
            return {"v": round(mean_r, 6)}

        best_reduction = 0.0
        best_feat = -1
        best_thresh = 0.0
        best_left_idx: List[int] = []
        best_right_idx: List[int] = []

        n_feats = len(X[0]) if X else 0
        # Subsample features
        feat_count = max(1, int(n_feats * 0.7))
        feat_indices = rng.sample(range(n_feats), min(feat_count, n_feats))

        parent_var = sum((r - mean_r) ** 2 for r in residuals)

        for feat_idx in feat_indices:
            values = sorted(set(row[feat_idx] for row in X))
            if len(values) <= 1:
                continue

            # Sample thresholds
            if len(values) <= 15:
                thresholds = [(values[i] + values[i + 1]) / 2.0 for i in range(len(values) - 1)]
            else:
                step = max(1, len(values) // 12)
                thresholds = [(values[i] + values[min(i + step, len(values) - 1)]) / 2.0
                              for i in range(0, len(values) - 1, step)]

            for thresh in thresholds:
                left_idx = [i for i in range(n) if X[i][feat_idx] <= thresh]
                right_idx = [i for i in range(n) if X[i][feat_idx] > thresh]

                if len(left_idx) < 3 or len(right_idx) < 3:
                    continue

                left_resid = [residuals[i] for i in left_idx]
                right_resid = [residuals[i] for i in right_idx]
                left_mean = sum(left_resid) / len(left_resid)
                right_mean = sum(right_resid) / len(right_resid)

                left_var = sum((r - left_mean) ** 2 for r in left_resid)
                right_var = sum((r - right_mean) ** 2 for r in right_resid)

                reduction = parent_var - left_var - right_var

                if reduction > best_reduction:
                    best_reduction = reduction
                    best_feat = feat_idx
                    best_thresh = thresh
                    best_left_idx = left_idx
                    best_right_idx = right_idx

        if best_feat == -1:
            return {"v": round(mean_r, 6)}

        return {
            "f": best_feat,
            "t": round(best_thresh, 6),
            "l": self._build_reg_node(
                [X[i] for i in best_left_idx],
                [residuals[i] for i in best_left_idx],
                depth + 1, rng,
            ),
            "r": self._build_reg_node(
                [X[i] for i in best_right_idx],
                [residuals[i] for i in best_right_idx],
                depth + 1, rng,
            ),
        }

    def _predict_regression_tree(self, tree: Dict[str, Any], X: List[List[float]]) -> List[float]:
        return [self._traverse_reg(tree, row) for row in X]

    def _traverse_reg(self, node: Dict[str, Any], row: List[float]) -> float:
        if "v" in node:
            return node["v"]
        if row[node["f"]] <= node["t"]:
            return self._traverse_reg(node["l"], row)
        else:
            return self._traverse_reg(node["r"], row)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "n_estimators": self.n_estimators,
            "learning_rate": self.learning_rate,
            "max_depth": self.max_depth,
            "seed": self.seed,
            "classes": self.classes_,
            "initial_log_odds": {str(k): v for k, v in self.initial_log_odds.items()},
            "boosted_trees": {str(k): v for k, v in self.boosted_trees.items()},
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GradientBoostingClassifier':
        gbm = cls(
            n_estimators=data.get("n_estimators", 40),
            learning_rate=data.get("learning_rate", 0.1),
            max_depth=data.get("max_depth", 4),
            seed=data.get("seed", 42),
        )
        gbm.classes_ = data.get("classes", [])
        gbm.initial_log_odds = {int(k): v for k, v in data.get("initial_log_odds", {}).items()}
        gbm.boosted_trees = {int(k): v for k, v in data.get("boosted_trees", {}).items()}
        return gbm


# ---------------------------------------------------------------------------
# Gaussian Naive Bayes Classifier
# ---------------------------------------------------------------------------

class GaussianNBClassifier:
    """
    Gaussian Naive Bayes classifier with log-space arithmetic and Laplace smoothing.
    Extremely fast training and evaluation with high accuracy on Gaussian feature spaces.
    """

    def __init__(self, var_smoothing: float = 1e-5):
        self.var_smoothing = var_smoothing
        self.classes_: List[int] = []
        self.class_priors_: Dict[int, float] = {}
        self.theta_: Dict[int, List[float]] = {}  # mean per class & feature
        self.var_: Dict[int, List[float]] = {}    # variance per class & feature

    def fit(self, X: List[List[float]], y: List[int], verbose: bool = False):
        self.classes_ = sorted(set(y))
        n_samples = len(y)
        n_features = len(X[0]) if X else 0

        # Calculate overall feature variance for smoothing
        total_var = []
        for j in range(n_features):
            vals = [X[i][j] for i in range(n_samples)]
            mean_j = sum(vals) / n_samples
            var_j = sum((v - mean_j) ** 2 for v in vals) / max(n_samples - 1, 1)
            total_var.append(var_j)
        epsilon = max(total_var) * self.var_smoothing if total_var else 1e-5

        for c in self.classes_:
            c_indices = [i for i in range(n_samples) if y[i] == c]
            n_c = len(c_indices)
            self.class_priors_[c] = n_c / n_samples

            c_means = []
            c_vars = []
            for j in range(n_features):
                vals = [X[i][j] for i in c_indices]
                if vals:
                    m = sum(vals) / n_c
                    v = sum((x - m) ** 2 for x in vals) / max(n_c - 1, 1)
                else:
                    m = 0.0
                    v = 1.0
                c_means.append(m)
                c_vars.append(max(v, epsilon))
            self.theta_[c] = c_means
            self.var_[c] = c_vars

        if verbose:
            print(f"  [GaussianNB] Fitted {len(self.classes_)} classes across {n_features} features.")

    def predict_proba(self, X: List[List[float]]) -> List[Dict[int, float]]:
        results = []
        for row in X:
            log_probs = {}
            for c in self.classes_:
                prior = self.class_priors_.get(c, 1e-6)
                lp = math.log(max(prior, 1e-12))
                means = self.theta_[c]
                vars_ = self.var_[c]
                for j, val in enumerate(row):
                    m = means[j]
                    v = vars_[j]
                    lp -= 0.5 * (math.log(2.0 * math.pi * v) + ((val - m) ** 2) / v)
                log_probs[c] = lp

            # Stable Softmax
            max_lp = max(log_probs.values()) if log_probs else 0.0
            exps = {c: math.exp(max(-50.0, min(50.0, lp - max_lp))) for c, lp in log_probs.items()}
            sum_exp = sum(exps.values()) + 1e-12
            probs = {c: v / sum_exp for c, v in exps.items()}
            results.append(probs)
        return results

    def predict(self, X: List[List[float]]) -> List[int]:
        proba = self.predict_proba(X)
        return [max(p, key=lambda c: p[c]) for p in proba]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "var_smoothing": self.var_smoothing,
            "classes": self.classes_,
            "class_priors": {str(k): round(v, 6) for k, v in self.class_priors_.items()},
            "theta": {str(k): [round(x, 6) for x in v] for k, v in self.theta_.items()},
            "var": {str(k): [round(x, 6) for x in v] for k, v in self.var_.items()},
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GaussianNBClassifier':
        gnb = cls(var_smoothing=data.get("var_smoothing", 1e-5))
        gnb.classes_ = data.get("classes", [])
        gnb.class_priors_ = {int(k): v for k, v in data.get("class_priors", {}).items()}
        gnb.theta_ = {int(k): v for k, v in data.get("theta", {}).items()}
        gnb.var_ = {int(k): v for k, v in data.get("var", {}).items()}
        return gnb


# ---------------------------------------------------------------------------
# Ensemble Voter (Soft-Voting: Random Forest + Gaussian NB + optional GBM)
# ---------------------------------------------------------------------------

class EnsembleClassifier:
    """
    Soft-voting ensemble combining Random Forest and Gaussian Naive Bayes predictions.
    Delivers rapid training (seconds), high accuracy (>85%), and robust uncertainty calibration.
    """

    def __init__(self, rf_weight: float = 0.45, nb_weight: float = 0.55, gbm_weight: float = 0.0):
        self.rf: Optional[RandomForest] = None
        self.nb: Optional[GaussianNBClassifier] = None
        self.gbm: Optional[GradientBoostingClassifier] = None
        self.rf_weight = rf_weight
        self.nb_weight = nb_weight
        self.gbm_weight = gbm_weight
        self.classes_: List[int] = []
        self.class_names: List[str] = []
        self.feature_names: List[str] = []
        self.feature_stats: Dict[str, Dict[str, float]] = {}

    def fit(
        self,
        X: List[List[float]],
        y: List[int],
        class_names: List[str],
        feature_names: List[str],
        rf_params: Optional[Dict[str, Any]] = None,
        nb_params: Optional[Dict[str, Any]] = None,
        gbm_params: Optional[Dict[str, Any]] = None,
        verbose: bool = True,
    ):
        self.classes_ = sorted(set(y))
        self.class_names = class_names
        self.feature_names = feature_names

        # Compute feature statistics for normalization reference
        n_feats = len(X[0]) if X else 0
        for i in range(n_feats):
            vals = [row[i] for row in X]
            fname = feature_names[i] if i < len(feature_names) else f"feat_{i}"
            self.feature_stats[fname] = {
                "mean": sum(vals) / len(vals),
                "min": min(vals),
                "max": max(vals),
                "std": math.sqrt(sum((v - sum(vals) / len(vals)) ** 2 for v in vals) / max(len(vals) - 1, 1)),
            }

        rf_p = rf_params or {}
        nb_p = nb_params or {}
        gbm_p = gbm_params or {}

        # 1. Train Gaussian Naive Bayes
        if self.nb_weight > 0.0:
            if verbose:
                print(f"\n  Training Gaussian Naive Bayes...")
            self.nb = GaussianNBClassifier(var_smoothing=nb_p.get("var_smoothing", 1e-5))
            self.nb.fit(X, y, verbose=verbose)

        # 2. Train Random Forest
        if self.rf_weight > 0.0:
            n_trees = rf_p.get("n_trees", 15)
            if verbose:
                print(f"\n  Training Random Forest ({n_trees} trees)...")
            self.rf = RandomForest(
                n_trees=n_trees,
                max_depth=rf_p.get("max_depth", 8),
                min_samples_split=rf_p.get("min_samples_split", 5),
                max_features_ratio=rf_p.get("max_features_ratio", 0.6),
                seed=rf_p.get("seed", 42),
            )
            self.rf.fit(X, y, verbose=verbose)

        # 3. Train Gradient Boosting (optional)
        if self.gbm_weight > 0.0 and gbm_p.get("n_estimators", 0) > 0:
            if verbose:
                print(f"\n  Training Gradient Boosting ({gbm_p.get('n_estimators')} iterations)...")
            self.gbm = GradientBoostingClassifier(
                n_estimators=gbm_p.get("n_estimators", 15),
                learning_rate=gbm_p.get("learning_rate", 0.1),
                max_depth=gbm_p.get("max_depth", 4),
                seed=gbm_p.get("seed", 42),
            )
            self.gbm.fit(X, y, verbose=verbose)

    def predict(self, X: List[List[float]]) -> List[int]:
        proba = self.predict_proba(X)
        return [max(p, key=lambda c: p[c]) for p in proba]

    def predict_proba(self, X: List[List[float]]) -> List[Dict[int, float]]:
        """Weighted soft-voting across GaussianNB, RandomForest, and GBM."""
        n_samples = len(X)
        rf_proba = self.rf.predict_proba(X) if (self.rf and self.rf_weight > 0) else None
        nb_proba = self.nb.predict_proba(X) if (self.nb and self.nb_weight > 0) else None
        gbm_proba = self.gbm.predict_proba(X) if (self.gbm and self.gbm_weight > 0) else None

        results = []
        total_weight = (
            (self.rf_weight if rf_proba else 0.0)
            + (self.nb_weight if nb_proba else 0.0)
            + (self.gbm_weight if gbm_proba else 0.0)
        )
        if total_weight <= 0:
            total_weight = 1.0

        for i in range(n_samples):
            combined = {}
            for c in self.classes_:
                prob_val = 0.0
                if rf_proba:
                    prob_val += self.rf_weight * rf_proba[i].get(c, 0.0)
                if nb_proba:
                    prob_val += self.nb_weight * nb_proba[i].get(c, 0.0)
                if gbm_proba:
                    prob_val += self.gbm_weight * gbm_proba[i].get(c, 0.0)
                combined[c] = prob_val / total_weight

            # Normalize probabilities
            total = sum(combined.values())
            if total > 0:
                combined = {c: v / total for c, v in combined.items()}
            results.append(combined)
        return results

    def predict_top_k(self, features: List[float], k: int = 3) -> List[Tuple[int, str, float]]:
        """Returns top-k predictions as (class_id, class_name, probability) tuples."""
        proba = self.predict_proba([features])[0]
        sorted_preds = sorted(proba.items(), key=lambda x: x[1], reverse=True)
        results = []
        for cls_id, prob in sorted_preds[:k]:
            name = self.class_names[cls_id] if cls_id < len(self.class_names) else f"Class-{cls_id}"
            results.append((cls_id, name, prob))
        return results

    def evaluate(self, X: List[List[float]], y: List[int]) -> Dict[str, Any]:
        """Evaluates the ensemble on a test set."""
        preds = self.predict(X)
        correct = sum(1 for p, t in zip(preds, y) if p == t)
        accuracy = correct / len(y) * 100 if y else 0.0

        # Per-class metrics
        per_class: Dict[int, Dict[str, int]] = {c: {"tp": 0, "fp": 0, "fn": 0} for c in self.classes_}
        for p, t in zip(preds, y):
            if p == t:
                per_class[t]["tp"] += 1
            else:
                per_class[p]["fp"] += 1
                per_class[t]["fn"] += 1

        class_metrics = []
        for c in self.classes_:
            tp = per_class[c]["tp"]
            fp = per_class[c]["fp"]
            fn = per_class[c]["fn"]
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
            name = self.class_names[c] if c < len(self.class_names) else f"Class-{c}"
            class_metrics.append({
                "class_id": c,
                "class_name": name,
                "precision": round(precision * 100, 1),
                "recall": round(recall * 100, 1),
                "f1": round(f1 * 100, 1),
            })

        return {
            "accuracy_pct": round(accuracy, 2),
            "total_samples": len(y),
            "correct": correct,
            "per_class": class_metrics,
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_type": "EnsembleClassifier",
            "rf_weight": self.rf_weight,
            "nb_weight": self.nb_weight,
            "gbm_weight": self.gbm_weight,
            "classes": self.classes_,
            "class_names": self.class_names,
            "feature_names": self.feature_names,
            "feature_stats": self.feature_stats,
            "rf": self.rf.to_dict() if self.rf else None,
            "nb": self.nb.to_dict() if self.nb else None,
            "gbm": self.gbm.to_dict() if self.gbm else None,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'EnsembleClassifier':
        ens = cls(
            rf_weight=data.get("rf_weight", 0.45),
            nb_weight=data.get("nb_weight", 0.55),
            gbm_weight=data.get("gbm_weight", 0.0),
        )
        ens.classes_ = data.get("classes", [])
        ens.class_names = data.get("class_names", [])
        ens.feature_names = data.get("feature_names", [])
        ens.feature_stats = data.get("feature_stats", {})
        rf_data = data.get("rf")
        nb_data = data.get("nb")
        gbm_data = data.get("gbm")
        if rf_data:
            ens.rf = RandomForest.from_dict(rf_data)
        if nb_data:
            ens.nb = GaussianNBClassifier.from_dict(nb_data)
        if gbm_data:
            ens.gbm = GradientBoostingClassifier.from_dict(gbm_data)
        return ens


# ---------------------------------------------------------------------------
# Model Serialization
# ---------------------------------------------------------------------------

def save_model(model: EnsembleClassifier, filepath: str):
    """Saves a trained EnsembleClassifier to a JSON file."""
    import os
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(model.to_dict(), f, separators=(",", ":"))
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  Model saved to {filepath} ({size_kb:.1f} KB)")


def load_model(filepath: str) -> Optional[EnsembleClassifier]:
    """Loads an EnsembleClassifier from a JSON file."""
    import os
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        model = EnsembleClassifier.from_dict(data)
        return model
    except Exception as e:
        print(f"  [Warning] Failed to load model from {filepath}: {e}")
        return None
