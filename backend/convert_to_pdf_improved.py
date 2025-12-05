"""
Improved script to convert BACKEND_DATABASE_DOCUMENTATION.md to PDF
Handles tables, lists, code blocks, and formatting better
"""
import os
import sys
import re

try:
    import markdown
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted, Table, TableStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
    from reportlab.lib.colors import HexColor, black, white
    from reportlab.lib import colors
except ImportError:
    print("Installing required packages...")
    os.system(f"{sys.executable} -m pip install markdown reportlab")
    import markdown
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted, Table, TableStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
    from reportlab.lib.colors import HexColor, black, white
    from reportlab.lib import colors

def escape_html(text):
    """Escape HTML special characters"""
    return (text.replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#39;'))

def format_inline_code(text):
    """Format inline code with monospace font"""
    return re.sub(
        r'`([^`]+)`',
        r'<font name="Courier" size="9" color="#1f2937"><b>\1</b></font>',
        text
    )

def format_bold_italic(text):
    """Format bold and italic text"""
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', text)
    return text

def markdown_to_pdf(markdown_file, output_pdf):
    """Convert markdown file to PDF using reportlab"""
    
    # Read markdown file
    with open(markdown_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Create PDF document
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Create styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#2563eb'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold',
    )
    
    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=HexColor('#2563eb'),
        spaceAfter=10,
        spaceBefore=20,
        fontName='Helvetica-Bold',
    )
    
    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#1d4ed8'),
        spaceAfter=8,
        spaceBefore=16,
        fontName='Helvetica-Bold',
    )
    
    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=HexColor('#3b82f6'),
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold',
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        spaceAfter=6,
    )
    
    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontSize=9,
        fontName='Courier',
        backColor=HexColor('#1f2937'),
        textColor=HexColor('#f9fafb'),
        leftIndent=10,
        rightIndent=10,
        spaceAfter=6,
    )
    
    # Build story (content)
    story = []
    
    # Parse markdown and convert to PDF elements
    lines = md_content.split('\n')
    in_code_block = False
    code_block_content = []
    in_table = False
    table_rows = []
    table_headers = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Handle code blocks
        if line.strip().startswith('```'):
            if in_code_block:
                # End code block
                if code_block_content:
                    code_text = '\n'.join(code_block_content)
                    story.append(Preformatted(code_text, code_style))
                    story.append(Spacer(1, 0.2*inch))
                    code_block_content = []
                in_code_block = False
            else:
                # Start code block
                in_code_block = True
            i += 1
            continue
        
        if in_code_block:
            code_block_content.append(line)
            i += 1
            continue
        
        # Handle tables (simple markdown tables)
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                in_table = True
                table_rows = []
            
            # Skip separator line
            if re.match(r'^\|[\s\-\|:]+\|$', line.strip()):
                i += 1
                continue
            
            # Parse table row
            cells = [cell.strip() for cell in line.split('|')[1:-1]]
            if cells:
                if not table_headers:
                    table_headers = cells
                else:
                    table_rows.append(cells)
            i += 1
            continue
        else:
            # End table if we were in one
            if in_table and table_rows:
                # Create table
                table_data = [table_headers] + table_rows
                table = Table(table_data, repeatRows=1)
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2563eb')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), white),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f9fafb')),
                    ('GRID', (0, 0), (-1, -1), 1, HexColor('#e5e7eb')),
                    ('FONTSIZE', (0, 1), (-1, -1), 10),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor('#f9fafb')]),
                ]))
                story.append(table)
                story.append(Spacer(1, 0.2*inch))
                table_rows = []
                table_headers = []
                in_table = False
        
        # Handle headers
        if line.startswith('# '):
            text = escape_html(line[2:].strip())
            story.append(Paragraph(text, title_style))
            story.append(Spacer(1, 0.1*inch))
        elif line.startswith('## '):
            text = escape_html(line[3:].strip())
            story.append(Paragraph(text, h1_style))
            story.append(Spacer(1, 0.1*inch))
        elif line.startswith('### '):
            text = escape_html(line[4:].strip())
            story.append(Paragraph(text, h2_style))
            story.append(Spacer(1, 0.05*inch))
        elif line.startswith('#### '):
            text = escape_html(line[5:].strip())
            story.append(Paragraph(text, h3_style))
            story.append(Spacer(1, 0.05*inch))
        elif line.strip() == '---':
            story.append(Spacer(1, 0.2*inch))
        elif line.strip().startswith('- ') or line.strip().startswith('* '):
            # List item
            text = escape_html(line.strip()[2:].strip())
            text = format_inline_code(format_bold_italic(text))
            story.append(Paragraph(f'• {text}', normal_style))
        elif line.strip() and re.match(r'^\d+\.', line.strip()):
            # Numbered list
            text = escape_html(line.strip())
            text = format_inline_code(format_bold_italic(text))
            story.append(Paragraph(text, normal_style))
        elif line.strip():
            # Regular paragraph
            text = escape_html(line.strip())
            text = format_inline_code(format_bold_italic(text))
            story.append(Paragraph(text, normal_style))
        else:
            # Empty line
            story.append(Spacer(1, 0.1*inch))
        
        i += 1
    
    # Build PDF
    print(f"Converting {markdown_file} to PDF...")
    doc.build(story)
    print(f"PDF created successfully: {output_pdf}")

if __name__ == "__main__":
    markdown_file = "BACKEND_DATABASE_DOCUMENTATION.md"
    output_pdf = "BACKEND_DATABASE_DOCUMENTATION.pdf"
    
    if not os.path.exists(markdown_file):
        print(f"Error: {markdown_file} not found!")
        sys.exit(1)
    
    markdown_to_pdf(markdown_file, output_pdf)

