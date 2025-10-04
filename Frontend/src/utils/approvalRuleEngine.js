// Frontend/src/utils/approvalRuleEngine.js

/**
 * Approval Rule Engine
 * Handles all approval rule logic including:
 * - Finding applicable rules
 * - Evaluating approval conditions
 * - Auto-approval detection
 * - Hybrid OR logic
 */

/**
 * Get applicable approval rule for an expense
 * @param {string} category - Expense category
 * @param {number} amount - Expense amount in company currency
 * @param {string} employeeName - Name of employee submitting expense
 * @returns {Object|null} - Applicable rule or null
 */
export const getApplicableRule = (category, amount, employeeName = null) => {
    const rules = JSON.parse(localStorage.getItem('approvalRules')) || [];
    
    // Find rule matching category (or user if user-based rules exist)
    let applicableRules = rules.filter(rule => {
        // Check if it's a category-based rule
        if (rule.category && rule.category === category) {
            // Check amount threshold if specified
            if (rule.amountThreshold) {
                return amount >= rule.amountThreshold;
            }
            return true;
        }
        
        // Check if it's a user-based rule
        if (rule.user && rule.user === employeeName) {
            return true;
        }
        
        return false;
    });
    
    // If multiple rules found, prefer:
    // 1. User-specific rules over category rules
    // 2. Rules with higher amount thresholds
    if (applicableRules.length > 0) {
        applicableRules.sort((a, b) => {
            // User-specific first
            if (a.user && !b.user) return -1;
            if (!a.user && b.user) return 1;
            
            // Then by threshold (higher first)
            return (b.amountThreshold || 0) - (a.amountThreshold || 0);
        });
        
        return applicableRules[0];
    }
    
    return null;
};

/**
 * Get list of approvers for an expense based on rule
 * @param {Object} rule - Approval rule
 * @param {string} managerName - Employee's direct manager
 * @returns {Array} - List of approvers with order
 */
export const getApproversList = (rule, managerName = null) => {
    if (!rule) return [];
    
    const approvers = [];
    
    // Add manager first if required
    if (rule.requireManagerApproval || rule.isManagerApprover) {
        if (managerName) {
            approvers.push({
                name: managerName,
                role: 'Manager',
                required: true,
                order: 1,
                type: 'manager'
            });
        }
    }
    
    // Add configured approvers
    const startOrder = approvers.length + 1;
    rule.approvers.forEach((approver, index) => {
        approvers.push({
            name: approver.name,
            role: approver.role || 'Approver',
            required: approver.required || false,
            order: rule.isSequential ? startOrder + index : startOrder,
            type: 'approver'
        });
    });
    
    return approvers;
};

/**
 * Get next approver in the chain
 * @param {Object} rule - Approval rule
 * @param {Array} approvalHistory - History of approvals
 * @param {string} managerName - Employee's manager
 * @returns {Object|null} - Next approver or null if complete
 */
export const getNextApprover = (rule, approvalHistory = [], managerName = null) => {
    if (!rule) return null;
    
    const allApprovers = getApproversList(rule, managerName);
    
    // If not sequential, return all pending approvers
    if (!rule.isSequential) {
        const approvedNames = approvalHistory
            .filter(h => h.status === 'approved')
            .map(h => h.approver);
        
        return allApprovers.filter(a => !approvedNames.includes(a.name));
    }
    
    // Sequential: find next in order
    const approvedNames = approvalHistory
        .filter(h => h.status === 'approved')
        .map(h => h.approver);
    
    for (let approver of allApprovers) {
        if (!approvedNames.includes(approver.name)) {
            return approver;
        }
    }
    
    return null; // All approved
};

/**
 * Check if expense is auto-approved based on rule conditions
 * @param {Object} rule - Approval rule
 * @param {Array} approvalHistory - History of approvals
 * @returns {Object} - { isAutoApproved: boolean, reason: string }
 */
export const checkAutoApproval = (rule, approvalHistory = []) => {
    if (!rule) {
        return { isAutoApproved: false, reason: 'No rule found' };
    }
    
    const approvals = approvalHistory.filter(h => h.status === 'approved');
    const approverNames = approvals.map(h => h.approver);
    
    // Check if any required approver has approved (auto-approval trigger)
    const requiredApprovers = rule.approvers.filter(a => a.required);
    const requiredApproverApproved = requiredApprovers.some(a => 
        approverNames.includes(a.name)
    );
    
    if (requiredApproverApproved && requiredApprovers.length > 0) {
        const approvedRequiredApprover = requiredApprovers.find(a => 
            approverNames.includes(a.name)
        );
        return {
            isAutoApproved: true,
            reason: `Auto-approved by required approver: ${approvedRequiredApprover.name}`
        };
    }
    
    // Check if minimum approval percentage is met
    if (rule.minApprovalPercentage && rule.approvers.length > 0) {
        const approvalPercentage = (approvals.length / rule.approvers.length) * 100;
        
        if (approvalPercentage >= rule.minApprovalPercentage) {
            return {
                isAutoApproved: true,
                reason: `Auto-approved: ${approvals.length}/${rule.approvers.length} approvers (${Math.round(approvalPercentage)}% ≥ ${rule.minApprovalPercentage}%)`
            };
        }
    }
    
    // Hybrid OR Logic: Check if EITHER condition is met
    if (requiredApproverApproved || 
        (rule.minApprovalPercentage && rule.approvers.length > 0 && 
         (approvals.length / rule.approvers.length) * 100 >= rule.minApprovalPercentage)) {
        return {
            isAutoApproved: true,
            reason: 'Hybrid rule condition met'
        };
    }
    
    return { isAutoApproved: false, reason: 'Conditions not met' };
};

/**
 * Check if all required approvals are complete
 * @param {Object} rule - Approval rule
 * @param {Array} approvalHistory - History of approvals
 * @returns {boolean} - True if all required approvals done
 */
export const areAllApprovalsComplete = (rule, approvalHistory = []) => {
    if (!rule) return false;
    
    const approvals = approvalHistory.filter(h => h.status === 'approved');
    const rejections = approvalHistory.filter(h => h.status === 'rejected');
    
    // If any rejection, not complete
    if (rejections.length > 0) {
        return false;
    }
    
    // Check auto-approval first
    const autoApproval = checkAutoApproval(rule, approvalHistory);
    if (autoApproval.isAutoApproved) {
        return true;
    }
    
    // Check if all approvers have approved
    const allApprovers = rule.approvers || [];
    const approverNames = approvals.map(h => h.approver);
    
    // If manager approval required, check it
    if (rule.requireManagerApproval || rule.isManagerApprover) {
        // Manager must be in approvals
        const managerApproved = approvalHistory.some(h => 
            h.status === 'approved' && h.type === 'manager'
        );
        if (!managerApproved) return false;
    }
    
    // All approvers must approve
    return allApprovers.every(approver => 
        approverNames.includes(approver.name)
    );
};

/**
 * Get approval status for an expense
 * @param {Object} expense - Expense object with approval history
 * @param {Object} rule - Applicable approval rule
 * @returns {string} - Status: 'pending', 'approved', 'rejected', 'partial'
 */
export const getApprovalStatus = (expense, rule) => {
    if (!expense.approvalHistory || expense.approvalHistory.length === 0) {
        return 'pending';
    }
    
    const history = expense.approvalHistory;
    
    // Check for rejections
    if (history.some(h => h.status === 'rejected')) {
        return 'rejected';
    }
    
    // Check if auto-approved
    const autoApproval = checkAutoApproval(rule, history);
    if (autoApproval.isAutoApproved) {
        return 'approved';
    }
    
    // Check if all approvals complete
    if (areAllApprovalsComplete(rule, history)) {
        return 'approved';
    }
    
    // Some approvals but not all
    if (history.some(h => h.status === 'approved')) {
        return 'partial';
    }
    
    return 'pending';
};

/**
 * Create approval workflow for expense
 * @param {Object} expense - Expense data
 * @param {string} employeeName - Employee name
 * @param {string} managerName - Manager name
 * @returns {Object} - Workflow with rule and approvers
 */
export const createApprovalWorkflow = (expense, employeeName, managerName) => {
    const rule = getApplicableRule(
        expense.category,
        expense.convertedAmount || expense.amount,
        employeeName
    );
    
    if (!rule) {
        return {
            hasRule: false,
            requiresApproval: false,
            message: 'No approval rule configured for this expense'
        };
    }
    
    const approvers = getApproversList(rule, managerName);
    
    return {
        hasRule: true,
        requiresApproval: true,
        rule: rule,
        approvers: approvers,
        isSequential: rule.isSequential,
        message: `Approval required: ${approvers.length} approver(s)`
    };
};

/**
 * Process approval action
 * @param {Object} expense - Expense object
 * @param {string} approverName - Name of approver
 * @param {string} action - 'approve' or 'reject'
 * @param {string} comments - Optional comments
 * @returns {Object} - Updated expense with status
 */
export const processApproval = (expense, approverName, action, comments = '') => {
    // Initialize approval history if not exists
    if (!expense.approvalHistory) {
        expense.approvalHistory = [];
    }
    
    // Add approval record
    const approvalRecord = {
        approver: approverName,
        status: action === 'approve' ? 'approved' : 'rejected',
        timestamp: new Date().toISOString(),
        comments: comments,
        date: new Date().toLocaleDateString('en-US')
    };
    
    expense.approvalHistory.push(approvalRecord);
    
    // Get applicable rule
    const rule = getApplicableRule(
        expense.category,
        expense.convertedAmount || expense.amount,
        expense.employee || expense.paidBy
    );
    
    // Determine final status
    if (action === 'reject') {
        expense.status = 'rejected';
        expense.finalStatus = 'Rejected';
    } else {
        // Check if auto-approved or all approvals complete
        const autoApproval = checkAutoApproval(rule, expense.approvalHistory);
        
        if (autoApproval.isAutoApproved) {
            expense.status = 'approved';
            expense.finalStatus = 'Approved';
            expense.autoApprovalReason = autoApproval.reason;
        } else if (areAllApprovalsComplete(rule, expense.approvalHistory)) {
            expense.status = 'approved';
            expense.finalStatus = 'Approved';
        } else {
            expense.status = 'pending';
            expense.finalStatus = 'Pending Approval';
        }
    }
    
    return expense;
};
