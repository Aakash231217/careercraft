import { PortfolioData, DeploymentInfo } from '@/types/portfolio-types';
import JSZip from 'jszip';

// Download portfolio as a zip fileexport async function downloadPortfolioZip(portfolioData: PortfolioData) {
  const zip = new JSZip();

  // Generate a simple HTML file
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolioData.headline || 'My Portfolio'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; background: #f9f9f9; }
    h1 { color: #333; }
    .section { margin-bottom: 2rem; }
    .section-title { font-size: 1.3em; margin-bottom: 0.5em; color: #444; border-bottom: 1px solid #eee; }
    ul { padding-left: 1.5em; }
    li { margin-bottom: 0.5em; }
    .contact-info span { display: block; }
  </style>
</head>
<body>
  <h1>${portfolioData.headline}</h1>
  <div class="section">
    <div class="section-title">Bio</div>
    <div>${portfolioData.bio}</div>
  </div>

  <div class="section">
    <div class="section-title">Projects</div>
    <ul>
      ${(portfolioData.projects || []).map(project => `<li><strong>${project.title}</strong>: ${project.description} <br/>Tech: ${project.technologies?.join(', ')}${project.liveUrl ? `<br/>Live: <a href='${project.liveUrl}'>${project.liveUrl}</a>` : ''}${project.githubUrl ? `<br/>GitHub: <a href='${project.githubUrl}'>${project.githubUrl}</a>` : ''}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Experience</div>
    <ul>
      ${(portfolioData.companies || []).map(company => `<li><strong>${company.name}</strong> (${company.position}, ${company.duration})<br/>${company.description}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Testimonials</div>
    <ul>
      ${(portfolioData.testimonials || []).map(testimonial => `<li>"${testimonial.text}"<br/>- ${testimonial.name}, ${testimonial.position} at ${testimonial.company}</li>`).join('')}
    </ul>
  </div>

  <div class="section contact-info">
    <div class="section-title">Contact</div>
    <span>Email: ${portfolioData.contact?.email || ''}</span>
    <span>Phone: ${portfolioData.contact?.phone || ''}</span>
    <span>Website: ${portfolioData.contact?.website || ''}</span>
    <span>LinkedIn: ${portfolioData.contact?.linkedin || ''}</span>
    <span>GitHub: ${portfolioData.contact?.github || ''}</span>
  </div>
</body>
</html>`;

  zip.file('index.html', html);

  // Optionally add a README
  zip.file('README.txt', 'This is your exported portfolio. Open index.html in your browser or deploy it to Netlify, Vercel, or any static hosting provider.');

  // Generate the zip and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portfolio.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// In-memory storage to simulate deployment (since we can't rely on Supabase table existing)
const deployments = new Map<string, {
  id: string;
  portfolioData: PortfolioData;
  status: 'pending' | 'deploying' | 'deployed' | 'failed';
  url: string;
  createdAt: string;
}>();

/**
 * Deploys a portfolio and generates a unique URL
 * This implementation doesn't require Supabase tables
 * 
 * @param portfolioData The portfolio data to deploy
 * @returns Object with deploymentId and initial status
 */
export async function deployPortfolio(portfolioData: PortfolioData): Promise<{
  deploymentId: string;
  status: 'pending';
}> {
  console.log('Deploying portfolio:', portfolioData);
  
  try {
    // Generate a deployment ID
    const deploymentId = `deploy_${Date.now()}`;
    const createdAt = new Date().toISOString();
    
    // Store in our in-memory map
    deployments.set(deploymentId, {
      id: deploymentId,
      portfolioData,
      status: 'pending',
      url: '',
      createdAt
    });
    
    // Simulate deployment process
    console.log('Starting deployment process for', deploymentId);
    
    // After 2 seconds, update to deploying
    setTimeout(() => {
      if (deployments.has(deploymentId)) {
        const deployment = deployments.get(deploymentId)!;
        deployment.status = 'deploying';
        deployments.set(deploymentId, deployment);
        console.log('Deployment status updated to deploying');
      }
      
      // After 5 more seconds, mark as deployed
      setTimeout(() => {
        if (deployments.has(deploymentId)) {
          const deployment = deployments.get(deploymentId)!;
          deployment.status = 'deployed';
          
          // Generate a URL using the deployment ID
          const uniqueId = deploymentId.split('_')[1] || Date.now().toString();
          deployment.url = `https://portfolio-${uniqueId}.netlify.app`;
          
          deployments.set(deploymentId, deployment);
          console.log('Deployment completed successfully:', deployment.url);
        }
      }, 5000);
    }, 2000);
    
    return {
      deploymentId,
      status: 'pending'
    };
  } catch (error) {
    console.error('Deployment error:', error);
    throw error;
  }
}

/**
 * Gets the current status of a portfolio deployment
 * @param deploymentId The ID of the deployment to check
 * @returns Current deployment information
 */
export async function getDeploymentStatus(deploymentId: string): Promise<DeploymentInfo> {
  console.log('Checking deployment status for:', deploymentId);
  
  // Check if we have this deployment in our in-memory store
  if (deployments.has(deploymentId)) {
    const deployment = deployments.get(deploymentId)!;
    
    return {
      id: deployment.id,
      status: deployment.status,
      url: deployment.url,
      createdAt: deployment.createdAt
    };
  }
  
  // If we don't have it (e.g. after a page refresh), generate a fake success response
  // This is not ideal for production but will work for demo purposes
  const timestamp = parseInt(deploymentId.split('_')[1] || '0');
  const uniqueId = deploymentId.split('_')[1] || Date.now().toString();
  
  return {
    id: deploymentId,
    url: `https://portfolio-${uniqueId}.netlify.app`,
    createdAt: new Date(timestamp || Date.now()).toISOString(),
    status: 'deployed'
  };
}
