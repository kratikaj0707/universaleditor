import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');

  // Mobile only
  if (!isDesktop.matches) {
    const sidebarId = 'mobile-sidebar';
    const existingSidebar = document.getElementById(sidebarId);

    if (!expanded) {
      // === OPEN SIDEBAR ===

      // Create sidebar container
      const sidebar = document.createElement('div');
      sidebar.id = sidebarId;
      
      sidebar.style.overflowY = 'auto';
      sidebar.style.zIndex = '1000';
      sidebar.style.transition = 'transform 0.3s ease';
      // sidebar.style.transform = 'translateX(0%)';

      // Clone navSections into sidebar
      const navClone = navSections.cloneNode(true);

// Find the ul inside the cloned structure
const ul = navClone.querySelector('.default-content-wrapper ul');

if (ul) {
  // Create a new <li><a>Home</a></li> element
  const homeLi = document.createElement('li');
  const homeLink = document.createElement('a');
  homeLink.href = '/'; // or your home route
  homeLink.textContent = 'Home';

  homeLi.appendChild(homeLink);

  // Insert as first child of <ul>
  ul.insertBefore(homeLi, ul.firstChild);
}

// Add the updated clone to the sidebar
sidebar.appendChild(navClone);
document.body.appendChild(sidebar);


      // Force reflow and slide in
      requestAnimationFrame(() => {
        sidebar.style.transform = 'translateX(0)';
        document.body.style.transition = 'transform 0.5s ease';
        document.body.style.transform = 'translateX(0%)';
      });

    } else {
      // === CLOSE SIDEBAR ===
      if (existingSidebar) {
        existingSidebar.style.transform = 'translateX(-100%)';
        document.body.style.transform = 'translateX(0)';

        setTimeout(() => {
          if (existingSidebar.parentNode) {
            existingSidebar.parentNode.removeChild(existingSidebar);
          }
        }, 300); // match transition duration
      }
    }
  }

  // Toggle aria and accessibility
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}


/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
 
  const navTop=document.createElement("div");
  navTop.id="nav-top";
  navTop.innerHTML="<span>SIGN IN</span><span>EN-US</span>";
  window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }})
  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
  const navTools = nav.querySelector('.nav-tools');

if (navTools) {
  const searchIconSpan = navTools.querySelector('.icon-search');
console.log(searchIconSpan);
  if (searchIconSpan) {
    // Create a wrapper
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'nav-search-wrapper';

    // Move the existing icon into wrapper
    searchWrapper.appendChild(searchIconSpan.cloneNode(true));

    // Create the search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'SEARCH';
    searchInput.className = 'nav-search-input';
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
          window.open(googleUrl, '_blank'); 
          searchInput.value = '';
          
        }
      }
    });
    // Add input to wrapper
    searchWrapper.appendChild(searchInput);

    // Replace the icon with the new wrapper
    searchIconSpan.replaceWith(searchWrapper);
  }
}

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          
          toggleAllNavSections(navSections);
          
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"><span></span></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(navTop);
  navWrapper.append(nav);
  block.append(navWrapper);
}
