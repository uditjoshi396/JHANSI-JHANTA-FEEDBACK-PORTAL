const PptxGenJS = require('pptxgenjs');

// Create a new presentation
let pptx = new PptxGenJS();

// Slide 1: Title Slide
let slide1 = pptx.addSlide();
slide1.addText('Janata Feedback Portal', { x: 1, y: 0.5, w: 8, h: 1, fontSize: 44, bold: true, color: '003366' });
slide1.addText('A Comprehensive Grievance Management System', { x: 1, y: 1.5, w: 8, h: 0.5, fontSize: 24, color: '666666' });
slide1.addText('Built with React, Node.js, Express, and MongoDB', { x: 1, y: 2.2, w: 8, h: 0.5, fontSize: 18, color: '999999' });

// Slide 2: Overview
let slide2 = pptx.addSlide();
slide2.addText('Project Overview', { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: '003366' });
slide2.addText([
    { text: 'Purpose: ', options: { bold: true } },
    { text: 'Platform for citizens to submit grievances and track their status' }
], { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18 });
slide2.addText([
    { text: 'Target Users: ', options: { bold: true } },
    { text: 'Citizens, Government Officers, Administrators' }
], { x: 0.5, y: 1.8, w: 9, h: 0.5, fontSize: 18 });
slide2.addText([
    { text: 'Technology Stack: ', options: { bold: true } },
    { text: 'React, Node.js, Express, MongoDB' }
], { x: 0.5, y: 2.4, w: 9, h: 0.5, fontSize: 18 });

// Slide 3: Key Features
let slide3 = pptx.addSlide();
slide3.addText('Key Features', { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: '003366' });
let features = [
    'User Authentication (JWT-based)',
    'Role-Based Access Control',
    'Grievance Submission & Tracking',
    'Real-time Status Updates',
    'File Attachments Support',
    'Email Notifications',
    'Social Authentication',
    'Responsive Design',
    'Admin Dashboard'
];
features.forEach((feature, index) => {
    slide3.addText(`• ${feature}`, { x: 0.5, y: 1.2 + index * 0.3, w: 9, h: 0.3, fontSize: 16 });
});

// Slide 4: Architecture
let slide4 = pptx.addSlide();
slide4.addText('System Architecture', { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: '003366' });
slide4.addText('Frontend (React)', { x: 1, y: 1.2, w: 3, h: 0.5, fontSize: 20, bold: true, color: '006600' });
slide4.addText('Backend (Node.js/Express)', { x: 5, y: 1.2, w: 4, h: 0.5, fontSize: 20, bold: true, color: '660000' });
slide4.addText('Database (MongoDB)', { x: 3, y: 2.5, w: 4, h: 0.5, fontSize: 20, bold: true, color: '006666' });
slide4.addShape(pptx.ShapeType.line, { x: 3.5, y: 1.8, w: 0, h: 0.5, line: { color: '000000', width: 2 } });
slide4.addShape(pptx.ShapeType.line, { x: 2.5, y: 2.2, w: 3, h: 0, line: { color: '000000', width: 2 } });
slide4.addShape(pptx.ShapeType.line, { x: 5.5, y: 2.2, w: 3, h: 0, line: { color: '000000', width: 2 } });

// Slide 5: User Roles
let slide5 = pptx.addSlide();
slide5.addText('User Roles & Permissions', { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: '003366' });
let roles = [
    { role: 'Citizen', permissions: ['Submit grievances', 'Track status', 'View own grievances'] },
    { role: 'Officer', permissions: ['View assigned grievances', 'Update status', 'Add comments'] },
    { role: 'Admin', permissions: ['Manage users', 'Assign grievances', 'Full system access'] }
];
roles.forEach((roleData, index) => {
    slide5.addText(roleData.role, { x: 0.5, y: 1.2 + index * 1.2, w: 2, h: 0.4, fontSize: 18, bold: true });
    roleData.permissions.forEach((perm, permIndex) => {
        slide5.addText(`• ${perm}`, { x: 3, y: 1.2 + index * 1.2 + permIndex * 0.3, w: 6, h: 0.3, fontSize: 14 });
    });
});

// Slide 6: API Endpoints
let slide6 = pptx.addSlide();
slide6.addText('API Endpoints', { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: '003366' });
let endpoints = [
    'POST /api/auth/register - User registration',
    'POST /api/auth/login - User login',
    'POST /api/grievances/create - Create grievance',
    'GET /api/grievances/my - Get user grievances',
    'PUT /api/grievances/update/:id - Update status'
];
endpoints.forEach((endpoint, index) => {
    slide6.addText(endpoint, { x: 0.5, y: 1.2 + index * 0.3, w: 9, h: 0.3, fontSize: 14 });
});

// Slide 7: Setup & Deployment
let slide7 = pptx.addSlide();
slide7.addText('Setup & Deployment', { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: '003366' });
slide7.addText('Prerequisites:', { x: 0.5, y: 1.2, w: 9, h: 0.4, fontSize: 18, bold: true });
slide7.addText('• Node.js (v14+)', { x: 0.5, y: 1.7, w: 9, h: 0.3, fontSize: 16 });
slide7.addText('• MongoDB', { x: 0.5, y: 2.0, w: 9, h: 0.3, fontSize: 16 });
slide7.addText('• npm', { x: 0.5, y: 2.3, w: 9, h: 0.3, fontSize: 16 });
slide7.addText('Automated Setup Scripts Available', { x: 0.5, y: 2.8, w: 9, h: 0.4, fontSize: 18, bold: true, color: '006600' });

// Slide 8: Future Enhancements
let slide8 = pptx.addSlide();
slide8.addText('Future Enhancements', { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: '003366' });
let enhancements = [
    'AI-powered grievance categorization',
    'Mobile app development',
    'Advanced analytics dashboard',
    'Integration with government APIs',
    'Multi-language support',
    'Blockchain for transparency'
];
enhancements.forEach((enhancement, index) => {
    slide8.addText(`• ${enhancement}`, { x: 0.5, y: 1.2 + index * 0.3, w: 9, h: 0.3, fontSize: 16 });
});

// Slide 9: Conclusion
let slide9 = pptx.addSlide();
slide9.addText('Conclusion', { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: '003366' });
slide9.addText('The Janata Feedback Portal provides a robust, scalable solution for citizen-government interaction, promoting transparency and efficient grievance resolution.', { x: 0.5, y: 1.2, w: 9, h: 1.5, fontSize: 18, align: 'center' });
slide9.addText('Built with modern technologies and best practices for reliability and user experience.', { x: 0.5, y: 2.8, w: 9, h: 0.5, fontSize: 16, align: 'center', color: '666666' });

// Save the presentation
pptx.writeFile({ fileName: 'Janata_Feedback_Portal_Presentation.pptx' });
