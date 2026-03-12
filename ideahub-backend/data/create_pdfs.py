import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib import colors

# Load projects
with open('demo_projects.json') as f:
    projects = json.load(f)

base_dir = 'pdfs'

def create_pdf(project, folder_path):
    """Create a PDF file for a project"""
    # Safe filename - remove special characters
    title = project.get('project_title', 'Project')
    safe_title = title.replace('/', '_').replace('&', 'and').replace('(', '').replace(')', '').replace('?', '').replace('*', '').replace(':', '').replace('"', '').replace('<', '').replace('>', '').replace('|', '')
    filename = os.path.join(folder_path, f"{safe_title}.pdf")
    
    doc = SimpleDocTemplate(filename, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#0369a1'),
        spaceAfter=6,
        spaceBefore=10
    )
    subheading_style = ParagraphStyle(
        'SubHeading',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#dc2626'),
        spaceAfter=4,
        spaceBefore=4,
        leftIndent=12
    )
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#374151'),
        leftIndent=20,
        spaceAfter=3
    )
    
    story = []
    
    # Title
    story.append(Paragraph(project.get('project_title', 'Project'), title_style))
    story.append(Spacer(1, 0.15*inch))
    
    # Abstract
    if project.get('abstract'):
        story.append(Paragraph('Abstract', heading_style))
        story.append(Paragraph(project['abstract'], styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # Problem Statement
    if project.get('problem_statement'):
        story.append(Paragraph('Problem Statement', heading_style))
        story.append(Paragraph(project['problem_statement'], styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # Methods &amp; Approach
    if project.get('methods_approach'):
        story.append(Paragraph('Methods &amp; Approach', heading_style))
        story.append(Paragraph(project['methods_approach'], styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # Technologies
    if project.get('technologies_used'):
        story.append(Paragraph('Technologies Used', heading_style))
        tech_text = ', '.join(project['technologies_used'])
        story.append(Paragraph(tech_text, styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # Algorithms
    if project.get('algorithms_models'):
        story.append(Paragraph('Algorithms &amp; Models', heading_style))
        algo_text = ', '.join(project['algorithms_models'])
        story.append(Paragraph(algo_text, styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # Datasets
    if project.get('datasets_used'):
        story.append(Paragraph('Datasets Used', heading_style))
        dataset_text = ', '.join(project['datasets_used'])
        story.append(Paragraph(dataset_text, styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # Keywords
    if project.get('keywords'):
        story.append(Paragraph('Keywords', heading_style))
        keywords_text = ', '.join(project['keywords'])
        story.append(Paragraph(keywords_text, styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # Domain
    if project.get('project_domain'):
        story.append(Paragraph('Project Domain', heading_style))
        story.append(Paragraph(project['project_domain'], styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # GitHub Repository
    if project.get('github_repo'):
        story.append(Paragraph('GitHub Repository', heading_style))
        story.append(Paragraph(project['github_repo'], styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    # Limitations
    if project.get('limitations') and len(project['limitations']) > 0:
        story.append(Paragraph('Limitations', heading_style))
        for limitation in project['limitations']:
            story.append(Paragraph(f'• {limitation}', bullet_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Future Improvements
    if project.get('future_improvements') and len(project['future_improvements']) > 0:
        story.append(Paragraph('Future Improvements', heading_style))
        for improvement in project['future_improvements']:
            story.append(Paragraph(f'→ {improvement}', bullet_style))
        story.append(Spacer(1, 0.1*inch))
    
    doc.build(story)
    return os.path.basename(filename)

# Create PDF for each project
created = 0
for i, project in enumerate(projects, 1):
    title = project['project_title']
    safe_name = title.replace(' ', '_').replace('&', 'and').replace('/', '_').replace('(', '').replace(')', '')
    folder_name = f"{i:02d}-{safe_name}"
    folder_path = os.path.join(base_dir, folder_name)
    
    try:
        pdf_file = create_pdf(project, folder_path)
        print(f"✓ {i:2d}. {title[:40]:<40} → {pdf_file}")
        created += 1
    except Exception as e:
        print(f"✗ {i:2d}. {title[:40]:<40} → ERROR: {str(e)}")

print(f"\n✓ Created {created}/16 PDF files with all sections successfully!")

