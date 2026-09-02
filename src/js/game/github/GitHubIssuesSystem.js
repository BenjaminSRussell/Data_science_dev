// ... (existing code)

/**
 * Merge pull request
 */
mergePullRequest(prId) {
    const pr = this.pullRequests.find(p => p.id === prId);
    if (!pr) {
        return { success: false, message: 'Pull request not found' };
    }
    
    if (pr.status !== 'open') {
        return { success: false, message: 'Pull request already merged or closed' };
    }
    
    // Check if reviews are required
    if (pr.reviews.length < 1) {
        return { success: false, message: 'Pull request needs at least 1 review' };
    }
    
    // Check if mergeable (regression guard)
    if (!pr.mergeable) {
        return { success: false, message: 'Pull request cannot be merged' };
    }
    
    pr.status = 'merged';
    pr.mergedAt = Date.now();
    
    return {
        success: true,
        pullRequest: pr,
        message: `Merged pull request #${pr.number}`
    };
}

// ... (existing code)