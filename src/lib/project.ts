import { useAuthStore } from '@/stores/auth';


export function getStatus(project) {
    if (!project.data) {
        return null
    }

    if (!project.data.status) {
        return 'draft';
    }

    return project.data.status;
}

function getPrivileges(project) {
    const authStore = useAuthStore();
    return authStore.privileges[project.data.group];
}

function getUserId() {
    const authStore = useAuthStore();
    return authStore.user.uid;
}

function getOwner(project) {
    return project.data.created_by;
}

function isOwner(project) {
    return getOwner(project) === getUserId();
}

function isCollaborator(project) {
    return project.data.collaborators?.includes(getUserId());
}

export function canEdit(project) {
    // if the project is not a draft, it cannot be edited by anyone else but the super admin
    if (getStatus(project) !== 'draft') {
        return false;
    }

    // super admin can edit any project
    const authStore = useAuthStore();
    if (authStore.isAdmin) {
        return true;
    }

    // if the user is group admin, he can edit any project if it is a draft
    const level = getPrivileges(project);
    if (level === 'admin') {
        return true;
    }

    // if the user is editor, he can edit the project if it is a draft and he is the owner
    return level === 'editor' && (isOwner(project) || isCollaborator(project));
}

export function canSubmit(project) {
    // if the project is not a draft, it cannot be submitted
    if (getStatus(project) !== 'draft') {
        return false;
    }

    const authStore = useAuthStore();
    if (authStore.isAdmin) {
        return true;
    }

    // if the user is group admin, he can submit any project if it is a draft
    const level = getPrivileges(project);
    if (level === 'admin') {
        return true;
    }

    // if the user is editor, he can submit the project if it is a draft and he is the owner
    return level === 'editor' && isOwner(project) || isCollaborator(project);
}

export function canPublish(project) {
    if (getStatus(project) !== 'submitted') {
        return false;
    }

    const authStore = useAuthStore();
    if (authStore.isAdmin) {
        return true;
    }

    // if the user is group admin, he can publish any project if it is submitted
    const level = getPrivileges(project);
    return level === 'admin';
}

export function canCreateVersion(project) {
    const authStore = useAuthStore();
    return getStatus(project) === 'public' && (isOwner(project) || isCollaborator(project) || getPrivileges(project) === 'admin') || authStore.isAdmin;
}

export function canReject(project) {
    return canPublish(project);
}

export function canAddBestPractice(project) {
    const authStore = useAuthStore();

    // Superadmins can add best practices to any project
    if (authStore.isAdmin) return true;

    // If the user is not an admin, check if they are an editor of the project's group
    return ['admin', 'editor'].includes(getPrivileges(project));
}

export function canAddCollaborators(project) {
    // Superadmins can add collaborators to any project
    // const authStore = useAuthStore();
    // if (authStore.isAdmin) return true;

    // If the user is not an admin, check if they are an editor of the project's group
    return ['admin'].includes(getPrivileges(project)) || (['editor'].includes(getPrivileges(project)) && isOwner(project) || isCollaborator(project));
}
