import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  try {
    const response = await fetch('/query-index.json');
    const data = await response.json();
    const items = data?.data || [];

    // Filter only articles
    const articleItems = items.filter(item => item.path.includes('/article'));

    if (!articleItems.length) {
      block.innerHTML = '<p>No articles found.</p>';
      return;
    }

    // Create <ul class="cards">
    const ul = document.createElement('ul');
    ul.classList.add('cards');

    articleItems.forEach((item) => {
      const li = document.createElement('li');
li.classList.add('cards-card');

// Wrap card content in a link
const cardLink = document.createElement('a');
cardLink.href = item.path;
cardLink.style.textDecoration = 'none'; // remove underline if desired
cardLink.style.color = 'inherit'; // ensure it doesn't change color

// Image section
const imgWrapper = document.createElement('div');
imgWrapper.className = 'cards-card-image';
imgWrapper.append(
  createOptimizedPicture(item.image, item.title, false, [{ width: '750' }])
);

// Body section
const bodyWrapper = document.createElement('div');
bodyWrapper.className = 'cards-card-body';
bodyWrapper.innerHTML = `
  <h2>${item.title}</h2>
  <p>${item.description}</p>
`;

// Append all to link, then to li
cardLink.append(imgWrapper, bodyWrapper);
li.appendChild(cardLink);
ul.appendChild(li);

    });

    // Clear the block and insert the rendered list
    block.textContent = '';
    block.appendChild(ul);

  } catch (error) {
    console.error('Error loading or processing articles:', error);
    block.innerHTML = '<p>Failed to load articles.</p>';
  }
}
