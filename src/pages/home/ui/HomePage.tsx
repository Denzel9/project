import { Box, CircularProgress, Drawer, Stack } from '@mui/material';

import { useMyApplicationsMap } from '@/entities/application';
import { useFavoritePostIds } from '@/entities/favorite';
import { usePostsQuery } from '@/entities/post';
import {
  MainFilter,
  toPostListParams,
  useMainFilterStore,
} from '@/features/main-filter';
import { SideBarFilter } from '@/features/main-filter/ui/SideBarFilter';
import { EmptyBlock } from '@/shared';
import { ACTION_BUTTONS_KEYS, PostItem, PageLayout } from '@/widgets';

export const HomePage = () => {
  const { isOpenMainFilter, setIsOpenMainFilter, postsType } =
    useMainFilterStore();

  const { data: posts, isLoading } = usePostsQuery(toPostListParams(postsType));

  const { favoritePostIds } = useFavoritePostIds();

  const { map: myApplicationsMap } = useMyApplicationsMap();

  const removePostFromCollection = (postId: string) => {
    myApplicationsMap.delete(postId);
  };

  return (
    <PageLayout>
      <Box
        sx={{
          top: 0,
          zIndex: 1000,
          position: 'sticky',
        }}
      >
        <MainFilter />
      </Box>

      <Box
        sx={{
          gap: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRadius: { xs: '16px', md: '32px' },
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && !posts?.items?.length && (
          <EmptyBlock title="Пока нет объявлений" />
        )}

        <Stack
          direction="column"
          spacing={2}
          sx={{
            width: '100%',
            alignItems: 'start',
          }}
        >
          {posts?.items?.map(post => {
            const application = myApplicationsMap.get(post.id);

            return (
              <PostItem
                post={post}
                key={post.id}
                applicationId={application?.id}
                isApplied={Boolean(application)}
                applicationStatus={application?.status}
                isFavorite={favoritePostIds.has(post.id)}
                removePostFromCollection={removePostFromCollection}
                permissions={[
                  favoritePostIds.has(post.id)
                    ? ACTION_BUTTONS_KEYS.REMOVE_FROM_COLLECTION
                    : ACTION_BUTTONS_KEYS.ADD_TO_COLLECTION,
                ]}
              />
            );
          })}
        </Stack>
      </Box>

      <Drawer
        anchor="right"
        open={isOpenMainFilter}
        onClose={() => setIsOpenMainFilter(!isOpenMainFilter)}
        sx={{
          '& .MuiDrawer-paper': {
            p: { xs: 2, md: 4 },
            borderTopLeftRadius: { xs: 0, md: 32 },
            borderBottomLeftRadius: { xs: 0, md: 32 },
            width: { xs: '100%', sm: '80%', md: '25%' },
          },
        }}
      >
        <SideBarFilter />
      </Drawer>
    </PageLayout>
  );
};

export default HomePage;
