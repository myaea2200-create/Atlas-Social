const postButton = document.getElementById('postBtn');
const suggestionInput = document.getElementById('suggestionInput');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const feedContainer = document.getElementById('feedContainer');
const postStatus = document.getElementById('postStatus');

function setPostStatus(message, isError = false) {
  if (!postStatus) {
    if (isError) window.alert(message);
    return;
  }
  postStatus.textContent = message;
  postStatus.classList.toggle('error', isError);
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function currentUser() {
  const { data, error } = await window.supabaseClient.auth.getUser();
  if (error || !data.user) throw new Error('Please log in first.');
  return data.user;
}

function renderPost(post, allComments, allLikes, userId) {
  const card = el('article', 'post glass-card');
  card.append(el('h4', 'post-author', `🌱 ${post.author_name || 'Atlas Guardian'}`));
  card.append(el('time', 'post-date', formatDate(post.created_at)));
  if (post.content) card.append(el('p', 'post-content', post.content));
  if (post.image_url) {
    const image = el('img', 'post-media');
    image.src = post.image_url;
    image.alt = 'Photo attached to post';
    image.loading = 'lazy';
    card.append(image);
  }
  const likes = allLikes.filter((like) => like.post_id === post.id);
  const liked = likes.some((like) => like.user_id === userId);
  const actions = el('div', 'post-actions');
  const likeButton = el('button', 'feed-button like-button', `${liked ? '♥ Liked' : '♡ Like'} (${likes.length})`);
  likeButton.type = 'button';
  likeButton.addEventListener('click', async () => {
    likeButton.disabled = true;
    const request = liked
      ? window.supabaseClient.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId)
      : window.supabaseClient.from('post_likes').insert({ post_id: post.id, user_id: userId });
    const { error } = await request;
    if (error) setPostStatus(error.message, true);
    await loadFeed();
  });
  actions.append(likeButton);
  if (post.user_id === userId) {
    const deleteButton = el('button', 'feed-button delete-button', 'Delete');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', async () => {
      if (!window.confirm('Are you sure you want to delete this post?')) return;
      deleteButton.disabled = true;
      const { data: deleted, error } = await window.supabaseClient.rpc('delete_own_post', { p_post_id: post.id });
      if (error || !deleted) {
        deleteButton.disabled = false;
        return setPostStatus(error?.message || 'This post could not be deleted because it does not belong to the current account.', true);
      }
      await loadFeed();
    });
    actions.append(deleteButton);
  }
  card.append(actions);

  const commentsBox = el('section', 'comments');
  commentsBox.append(el('h5', 'comments-title', 'Comments'));
  const commentList = el('div', 'comment-list');
  allComments.filter((comment) => comment.post_id === post.id).forEach((comment) => {
    const line = el('p', 'comment');
    line.append(el('strong', '', `${comment.author_name}: `), document.createTextNode(comment.content));
    commentList.append(line);
  });
  const form = el('form', 'comment-form');
  const input = document.createElement('input');
  input.type = 'text'; input.maxLength = 300; input.required = true; input.placeholder = 'Write a comment…';
  const submit = el('button', 'feed-button', 'Comment'); submit.type = 'submit';
  form.append(input, submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const content = input.value.trim();
    if (!content) return;
    submit.disabled = true;
    const user = await currentUser();
    const { data, error } = await window.supabaseClient.from('comments').insert({ post_id: post.id, user_id: user.id, author_name: user.email.split('@')[0], content }).select().single();
    submit.disabled = false;
    if (error) return setPostStatus(error.message, true);
    const line = el('p', 'comment');
    line.append(el('strong', '', `${data.author_name}: `), document.createTextNode(data.content));
    commentList.append(line); input.value = '';
  });
  commentsBox.append(commentList, form);
  card.append(commentsBox);
  return card;
}

async function loadFeed() {
  if (!feedContainer || !window.supabaseClient) return;
  try {
    const user = await currentUser();
    const [postsResult, commentsResult, likesResult] = await Promise.all([
      window.supabaseClient.from('posts').select('*').order('created_at', { ascending: false }),
      window.supabaseClient.from('comments').select('*').order('created_at'),
      window.supabaseClient.from('post_likes').select('post_id,user_id')
    ]);
    const error = postsResult.error || commentsResult.error || likesResult.error;
    if (error) throw error;
    feedContainer.replaceChildren();
    if (!postsResult.data.length) return feedContainer.append(el('p', 'empty-feed', 'No posts yet. Be the first Guardian to share an idea!'));
    postsResult.data.forEach((post) => feedContainer.append(renderPost(post, commentsResult.data, likesResult.data, user.id)));
  } catch (error) {
    feedContainer.replaceChildren(el('p', 'empty-feed error', error.message));
  }
}

if (fileInput) fileInput.addEventListener('change', () => { fileName.textContent = fileInput.files[0]?.name || 'No photo selected'; });

if (postButton) postButton.addEventListener('click', async () => {
  const content = suggestionInput.value.trim(); const photo = fileInput.files[0];
  if (!content && !photo) return setPostStatus('Write a suggestion or choose a photo first.', true);
  if (photo && (!photo.type.startsWith('image/') || photo.size > 5 * 1024 * 1024)) return setPostStatus('Use an image no larger than 5 MB.', true);
  postButton.disabled = true; setPostStatus('Publishing post…');
  try {
    const user = await currentUser(); let imageUrl = null;
    if (photo) {
      const extension = photo.name.split('.').pop().toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await window.supabaseClient.storage.from('post-images').upload(path, photo, { contentType: photo.type });
      if (uploadError) throw uploadError;
      imageUrl = window.supabaseClient.storage.from('post-images').getPublicUrl(path).data.publicUrl;
    }
    const { error } = await window.supabaseClient.from('posts').insert({ user_id: user.id, author_name: user.email.split('@')[0], content: content || null, image_url: imageUrl });
    if (error) throw error;
    suggestionInput.value = ''; fileInput.value = ''; fileName.textContent = 'No photo selected';
    window.location.assign('Home.html');
  } catch (error) { setPostStatus(error.message, true); postButton.disabled = false; }
});

if (feedContainer) loadFeed();
