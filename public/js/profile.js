document.addEventListener('DOMContentLoaded', () => {
    const profilePicture = document.getElementById('profile-picture');
    const avatarModal = document.getElementById('avatar-modal');
    const closeModal = document.getElementById('close-modal');
    const avatarInput = document.getElementById('avatar-input');
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');

    profilePicture?.addEventListener('click', () => {
        avatarModal.classList.remove('hidden');
    });

    closeModal?.addEventListener('click', () => {
        avatarModal.classList.add('hidden');
    });

    avatarModal?.addEventListener('click', (event) => {
        if (event.target === avatarModal) {
            avatarModal.classList.add('hidden');
        }
    });

    uploadAvatarBtn?.addEventListener('click', async () => {
        const file = avatarInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/avatars/uploadAvatar', {
                method: 'POST',
                body: formData,
            });

            console.log('Response:', response);

            if (response.ok) {
                const data = await response.json();
                profilePicture.src = data.profilePictureUrl;
                avatarModal.classList.add('hidden');
            } else {
                console.error('Failed to upload avatar.');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    });
});
