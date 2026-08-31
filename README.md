# Multi-page portfolio

This version keeps the visual structure of the reference layout while making the interface more interactive and the project architecture scalable.

## Structure

- `index.html` — About
- `resume.html` — Resume
- `projects.html` — Portfolio index
- `blog.html` — Blog
- `contact.html` — Contact
- `projects/project-1.html` etc. — standalone project pages
- `css/style.css` — shared visual system
- `js/main.js` — shared interaction system
- `images/` — replace the SVG placeholders with your own assets

## Interaction system

- Sparse, uniform canvas grid that remains subtle behind the content
- Very small cursor attraction rather than heavy distortion
- Local cursor illumination
- Click ripples
- Cursor-aware card tilt and spotlight
- Animated active-navigation pill
- Page exit transition before navigating between documents
- Scroll reveal animations
- Project category filtering
- Persistent dark/light theme across all pages
- Reduced-motion support

## Adding a project

1. Copy any file in `projects/`.
2. Rename it, for example `projects/my-project.html`.
3. Replace its title, description, image, sections, and technologies.
4. Add one project card to `projects.html`.
5. Keep the same relative paths so the shared CSS/JS continue working.
