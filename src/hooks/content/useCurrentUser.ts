import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useCurrentUser = (enabled: boolean = true) => {
  const {
    isFetching: isFetchCurrentUserPending,
    data: currentUserResp,
    refetch: refetchCurrentUser
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.user.findById(api.auth.getCurrentUserId()),
    enabled: typeof localStorage != 'undefined' && enabled
  });

  const currentUser = React.useMemo(() => {
    if (!currentUserResp) return null;
    return currentUserResp;
  }, [currentUserResp]);

  const {
    isFetching: isFetchProfilePicturePending,
    data: profilePictureResp,
    refetch: refetchProfilePicture
  } = useQuery({
    queryKey: ['profile-picture'],
    queryFn: () => {
      return api.upload.fetchBlobById(currentUser?.pictureId);
    },
    enabled: currentUser != null
  });

  const profilePicture = React.useMemo(() => {
    if (!profilePictureResp) return null;
    return new File([profilePictureResp], 'profile-picture');
  }, [profilePictureResp]);

  return {
    currentUser,
    profilePicture,
    refetchCurrentUser,
    refetchProfilePicture,
    isFetchCurrentUserPending,
    isFetchProfilePicturePending
  };
};
