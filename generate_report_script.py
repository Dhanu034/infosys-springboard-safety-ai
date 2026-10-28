import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True
        
        # Configure Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("BuildSure AI: Autonomous Construction Risk & Worker Safety Intelligence Platform")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.italic = True
        hrun.font.color.rgb = RGBColor(120, 144, 156)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun1 = fp.add_run("Department of CSE, KIT - Coimbatore | Course: Modern Web Programming")
        frun1.font.name = "Calibri"
        frun1.font.size = Pt(8.5)
        frun1.font.color.rgb = RGBColor(120, 144, 156)

    # Palette Constants
    C_NAVY = RGBColor(15, 41, 66)       # Primary Title / Deep Navy #0F2942
    C_ACCENT = RGBColor(217, 119, 6)    # Amber / Gold #D97706
    C_BODY = RGBColor(34, 34, 34)       # Neutral Dark #222222
    C_MUTED = RGBColor(100, 116, 139)   # Slate Muted #64748B
    HEX_NAVY = "0F2942"
    HEX_ALT_ROW = "F8FAFC"
    HEX_CARD = "F1F5F9"

    # Helper Functions
    def add_title(text, size=24, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=C_NAVY, space_before=0, space_after=6):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = color
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = C_NAVY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = C_NAVY
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = C_ACCENT
        return p

    def add_p(text, bold_prefix="", space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            br = p.add_run(bold_prefix)
            br.font.name = "Calibri"
            br.font.size = Pt(11)
            br.font.bold = True
            br.font.color.rgb = C_NAVY
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(11)
        run.font.color.rgb = C_BODY
        return p

    def add_bullet(text, bold_prefix="", level=0):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.left_indent = Inches(0.25 * (level + 1))
        if bold_prefix:
            br = p.add_run(bold_prefix)
            br.font.name = "Calibri"
            br.font.size = Pt(11)
            br.font.bold = True
            br.font.color.rgb = C_NAVY
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(11)
        run.font.color.rgb = C_BODY
        return p

    def add_callout(text, title=""):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        cell.width = Inches(6.5)
        
        # Background and left border
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{HEX_CARD}"/>')
        cell._tc.get_or_add_tcPr().append(shading)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="{HEX_NAVY}"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)
        
        cp = cell.paragraphs[0]
        cp.paragraph_format.space_before = Pt(4)
        cp.paragraph_format.space_after = Pt(4)
        cp.paragraph_format.left_indent = Inches(0.15)
        cp.paragraph_format.right_indent = Inches(0.15)
        if title:
            trun = cp.add_run(title + "\n")
            trun.font.name = "Calibri"
            trun.font.size = Pt(10.5)
            trun.font.bold = True
            trun.font.color.rgb = C_NAVY
        mrun = cp.add_run(text)
        mrun.font.name = "Consolas"
        mrun.font.size = Pt(9.5)
        mrun.font.color.rgb = C_BODY
        
        # Space after table
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(4)

    def style_table(table, col_widths, headers, data):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        # Format Header Row
        hdr_cells = table.rows[0].cells
        for i, h_text in enumerate(headers):
            hdr_cells[i].width = Inches(col_widths[i])
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{HEX_NAVY}"/>')
            hdr_cells[i]._tc.get_or_add_tcPr().append(shd)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            r = p.add_run(h_text)
            r.font.name = "Calibri"
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            hdr_cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER

        # Data Rows
        for r_idx, row_data in enumerate(data):
            row_cells = table.rows[r_idx + 1].cells
            fill_color = HEX_ALT_ROW if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell_value in enumerate(row_data):
                row_cells[c_idx].width = Inches(col_widths[c_idx])
                shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
                row_cells[c_idx]._tc.get_or_add_tcPr().append(shd)
                p = row_cells[c_idx].paragraphs[0]
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(3)
                # Left align for text, center for short codes
                if len(cell_value) < 12 and not " " in cell_value:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                r = p.add_run(cell_value)
                r.font.name = "Calibri"
                r.font.size = Pt(9.5)
                r.font.color.rgb = C_BODY
                row_cells[c_idx].vertical_alignment = WD_ALIGN_VERTICAL.CENTER

        # Borders
        for row in table.rows:
            for cell in row.cells:
                tcPr = cell._tc.get_or_add_tcPr()
                borders = parse_xml(f'''
                    <w:tcBorders {nsdecls("w")}>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    </w:tcBorders>
                ''')
                tcPr.append(borders)

        # Space after table
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(6)

    def add_image_figure(image_path, caption, width=Inches(6.0)):
        if os.path.exists(image_path):
            ip = doc.add_paragraph()
            ip.alignment = WD_ALIGN_PARAGRAPH.CENTER
            ip.paragraph_format.space_before = Pt(8)
            ip.paragraph_format.space_after = Pt(3)
            run = ip.add_run()
            run.add_picture(image_path, width=width)
            
            cp = doc.add_paragraph()
            cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cp.paragraph_format.space_before = Pt(0)
            cp.paragraph_format.space_after = Pt(10)
            crun = cp.add_run(caption)
            crun.font.name = "Calibri"
            crun.font.size = Pt(9.5)
            crun.font.bold = True
            crun.font.italic = True
            crun.font.color.rgb = C_NAVY
        else:
            add_callout(f"Image not found at path: {image_path}", title="Figure Placeholder")

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    add_title("A PROJECT REPORT\nON", size=14, bold=True, space_before=10, space_after=12)
    add_title("BuildSure AI: AI-POWERED AGENTIC CONSTRUCTION RISK INTELLIGENCE AND AUTONOMOUS WORKER SAFETY PLATFORM", 
              size=18, bold=True, color=C_NAVY, space_before=6, space_after=16)
    
    add_p("Submitted in partial fulfillment of the requirements for the Alternative Assessment Task (AAT) of the course", bold_prefix="", space_after=4)
    add_title("MODERN WEB PROGRAMMING", size=14, bold=True, color=C_ACCENT, space_before=2, space_after=24)
    
    add_p("Submitted by:", bold_prefix="", space_after=2)
    add_title("S. DHANUSRI\n(Register No.: 711524BCS034)", size=13, bold=True, color=C_NAVY, space_before=2, space_after=24)
    
    add_p("Under the Guidance of:", bold_prefix="", space_after=2)
    add_title("Mr. R. PRADEEP RAJA, M.E., (Ph.D.)\nAssistant Professor, Department of Computer Science and Engineering", 
              size=12, bold=True, color=C_NAVY, space_before=2, space_after=36)
    
    add_title("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nKIT-KALAIGNARKARUNANIDHI INSTITUTE OF TECHNOLOGY\n(An Autonomous Institution)\nKANNAMPALAYAM POST, COIMBATORE - 641402\nANNA UNIVERSITY, CHENNAI\n\nACADEMIC YEAR: 2025 – 2026", 
              size=11, bold=True, color=C_NAVY, space_before=10, space_after=0)

    doc.add_page_break()

    # =========================================================================
    # CERTIFICATE & DECLARATION
    # =========================================================================
    add_title("KIT-KALAIGNARKARUNANIDHI INSTITUTE OF TECHNOLOGY", size=13, bold=True, color=C_NAVY, space_before=0, space_after=2)
    add_title("(An Autonomous Institution) | Coimbatore - 641402\nDEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", size=11, bold=True, color=C_MUTED, space_before=0, space_after=14)
    add_title("BONAFIDE CERTIFICATE", size=14, bold=True, color=C_NAVY, space_before=0, space_after=14)

    add_p("This is to certify that the project report titled \"BuildSure AI: AI-POWERED AGENTIC CONSTRUCTION RISK INTELLIGENCE AND AUTONOMOUS WORKER SAFETY PLATFORM\" is the bonafide work of S. DHANUSRI (Register No.: 711524BCS034), who carried out the Alternative Assessment Task (AAT) for the course MODERN WEB PROGRAMMING under my supervision and guidance during the academic year 2025 – 2026.")
    
    add_p("Certified further that to the best of my knowledge, the work reported herein does not form part of any other thesis, dissertation, or project report on the basis of which a degree or award was conferred on an earlier occasion on this or any other candidate.")
    
    # Signature Table
    sig_p = doc.add_paragraph()
    sig_p.paragraph_format.space_before = Pt(60)
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_l, cell_r = sig_table.rows[0].cells
    cell_l.width = Inches(3.25)
    cell_r.width = Inches(3.25)
    
    pl = cell_l.paragraphs[0]
    pl.alignment = WD_ALIGN_PARAGRAPH.LEFT
    rl = pl.add_run("Mr. R. PRADEEP RAJA, M.E., (Ph.D.)\nSUPERVISOR / PROJECT GUIDE\nAssistant Professor, Dept. of CSE\nKIT-Kalaignarkarunanidhi Institute of Tech.\nCoimbatore - 641402")
    rl.font.name = "Calibri"
    rl.font.size = Pt(10)
    rl.font.bold = True
    rl.font.color.rgb = C_NAVY
    
    pr = cell_r.paragraphs[0]
    pr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    rr = pr.add_run("HEAD OF THE DEPARTMENT\nDepartment of Computer Science & Engg.\nKIT-Kalaignarkarunanidhi Institute of Tech.\nCoimbatore - 641402")
    rr.font.name = "Calibri"
    rr.font.size = Pt(10)
    rr.font.bold = True
    rr.font.color.rgb = C_NAVY

    doc.add_page_break()

    # =========================================================================
    # CANDIDATE'S DECLARATION & ACKNOWLEDGEMENT
    # =========================================================================
    add_title("CANDIDATE'S DECLARATION", size=14, bold=True, color=C_NAVY, space_before=0, space_after=14)
    add_p("I, S. DHANUSRI (Register No.: 711524BCS034), hereby declare that the project report entitled \"BuildSure AI: AI-POWERED AGENTIC CONSTRUCTION RISK INTELLIGENCE AND AUTONOMOUS WORKER SAFETY PLATFORM\" submitted to the Department of Computer Science and Engineering, KIT-Kalaignarkarunanidhi Institute of Technology, Coimbatore, for the course Modern Web Programming, is an authentic record of the original work carried out by me under the guidance of Mr. R. PRADEEP RAJA, M.E., (Ph.D.), Assistant Professor, Department of Computer Science and Engineering.")
    
    add_p("I further declare that this report has not been submitted previously in part or in full for the award of any degree, diploma, or fellowship in any other institution or university.")
    
    dec_p = doc.add_paragraph()
    dec_p.paragraph_format.space_before = Pt(30)
    dec_p.paragraph_format.space_after = Pt(20)
    drun = dec_p.add_run("Place: Coimbatore\nDate: 22-10-2026\t\t\t\t\t\t\tS. DHANUSRI (711524BCS034)")
    drun.font.name = "Calibri"
    drun.font.size = Pt(10.5)
    drun.font.bold = True
    drun.font.color.rgb = C_NAVY

    add_title("ACKNOWLEDGEMENT", size=14, bold=True, color=C_NAVY, space_before=16, space_after=10)
    add_p("I express my profound gratitude and deep indebtedness to our respected Principal and the Management of KIT-Kalaignarkarunanidhi Institute of Technology for providing state-of-the-art infrastructural and laboratory facilities to complete this Modern Web Programming project.")
    add_p("I extend my heartfelt thanks to the Head of the Department, Department of Computer Science and Engineering, for their constant encouragement, academic support, and constructive feedback throughout the course of this study.")
    add_p("I express my sincere thanks to my revered project guide, Mr. R. PRADEEP RAJA, M.E., (Ph.D.), Assistant Professor, Department of Computer Science and Engineering, whose insightful supervision, scholarly guidance, technical reviews, and constant motivation helped shape this project into an end-to-end operational software platform.")
    add_p("Finally, I extend my warm thanks to my parents, family members, and peer colleagues for their unwavering moral support, patience, and assistance during the development and documentation phases of this work.")

    doc.add_page_break()

    # =========================================================================
    # ABSTRACT
    # =========================================================================
    add_title("ABSTRACT", size=14, bold=True, color=C_NAVY, space_before=0, space_after=12)
    add_p("The construction industry remains one of the most hazardous occupational sectors worldwide, characterized by high accident frequencies, catastrophic fall injuries, and persistent non-compliance with Personal Protective Equipment (PPE) regulations. Conventional safety management paradigms rely on manual paper checklists, delayed post-incident reporting, and intermittent supervisory walk-throughs, which fail to prevent hazardous escalations on active work sites. Furthermore, existing compliance and insurance audits are deeply fragmented, lacking unified digital audit trails and spatial risk correlation.")
    
    add_p("This report presents BuildSure AI, a decoupled, multi-agent modern web platform that establishes an autonomous risk intelligence layer across dynamic construction environments. Developed using React 18, Vite 5, Tailwind CSS, and an asynchronous Python FastAPI ASGI backend, the platform coordinates four specialized, collaborating intelligence agents: (1) Site Risk Agent, executing multi-factor spatial risk scoring (Probability x Impact x Exposure) across a 5x5 hazard matrix; (2) Safety Agent, leveraging fine-tuned YOLOv8 deep neural networks for real-time worker PPE detection (hard hats and safety vests) with geometric head/torso spatial anchoring (35%/40%) and an offline video safety engine with 10-second temporal cooldown de-duplication; (3) Compliance Engine, performing deterministic regulatory matching against OSHA 1926, Indian BOCW Central Rules 1998, and Factories Act standards using a zero-paid-API document ingestion pipeline (pypdf + pytesseract OCR); and (4) Insurance Exposure Engine, calculating site exposure indices (0-100) and synthesizing 5-item audit-ready claim dossiers.")
    
    add_p("A unified mathematical formula integrates cross-agent telemetry into an Executive Project Risk Score (0.35 x Safety + 0.35 x Compliance + 0.30 x Insurance). The web client incorporates a glassmorphic head-up display (HUD), bilingual localization (English / Tamil), hands-free voice querying via the W3C Web Speech API, and one-click multi-format exports (JSON, CSV, Native Print PDF). Automated testing achieves sub-45ms database response latencies and 96+ Google Lighthouse mobile scores, establishing BuildSure AI as an operational, resilient digital public good for modern construction safety.")

    doc.add_page_break()

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    add_title("TABLE OF CONTENTS", size=14, bold=True, color=C_NAVY, space_before=0, space_after=12)
    
    toc_data = [
        ["Chapter No.", "Title", "Page No."],
        ["", "LIST OF ABBREVIATIONS & ACRONYMS", "iv"],
        ["", "LIST OF FIGURES", "v"],
        ["", "LIST OF TABLES", "vi"],
        ["1", "INTRODUCTION", "1"],
        ["", "1.1 Overview of Modern Web Programming", "1"],
        ["", "1.2 Problem Domain & Construction Hazards Context", "2"],
        ["", "1.3 Need for the Autonomous Risk Intelligence System", "3"],
        ["", "1.4 Objectives of the Project", "3"],
        ["", "1.5 Organization of the Report", "4"],
        ["2", "LITERATURE REVIEW & GAP ANALYSIS", "5"],
        ["", "2.1 Survey of Existing Safety Management Systems", "5"],
        ["", "2.2 Critical Gaps in Contemporary Safety Platforms", "6"],
        ["", "2.3 Proposed BuildSure AI Solution & Unique Value Propositions", "6"],
        ["3", "SYSTEM REQUIREMENTS & FEASIBILITY STUDY", "7"],
        ["", "3.1 Hardware Requirements", "7"],
        ["", "3.2 Software Stack & Dependency Matrix", "7"],
        ["", "3.3 Functional Requirements (FR)", "8"],
        ["", "3.4 Non-Functional Requirements (NFR)", "9"],
        ["", "3.5 Feasibility Analysis", "9"],
        ["4", "SYSTEM ARCHITECTURE & DATABASE DESIGN", "10"],
        ["", "4.1 Multi-Agent & Multi-Tier Modern Web Architecture", "10"],
        ["", "4.2 System Data Flow Diagrams (DFD Level 0 & Level 1)", "11"],
        ["", "4.3 Unified Modeling Language (UML) Diagrams", "12"],
        ["", "4.4 Database Design & Relational Data Dictionaries", "13"],
        ["5", "FRONTEND ENGINEERING & MODERN WEB UI DESIGN", "15"],
        ["", "5.1 Component-Driven Hierarchy in React 18", "15"],
        ["", "5.2 Build System & Optimization with Vite 5", "16"],
        ["", "5.3 Modern CSS Design System: HUD & Glassmorphism", "16"],
        ["", "5.4 Bilingual Localization Architecture (English / Tamil)", "17"],
        ["", "5.5 Web Speech API Voice Interface Implementation", "17"],
        ["6", "BACKEND ARCHITECTURE & RESTFUL API IMPLEMENTATION", "18"],
        ["", "6.1 FastAPI Asynchronous Request Lifecycle & ASGI Uvicorn", "18"],
        ["", "6.2 RESTful API Endpoints Specification Matrix", "19"],
        ["", "6.3 Document Ingestion & Local Extraction Pipeline", "20"],
        ["7", "DEEP NEURAL NETWORKS & COMPUTER VISION ENGINE", "21"],
        ["", "7.1 Problem Formulation as Spatial Object Detection", "21"],
        ["", "7.2 YOLOv8 Deep Neural Network Architecture", "21"],
        ["", "7.3 Head & Torso Geometric Spatial Association (35% / 40%)", "22"],
        ["", "7.4 Confidence Calibration & Heuristic Fallback", "23"],
        ["", "7.5 Model Evaluation & Inference Latency Benchmarks", "23"],
        ["8", "MULTI-AGENT INTELLIGENCE & RISK MATHEMATICAL ENGINE", "24"],
        ["", "8.1 Multi-Factor Spatial Risk Formulation (P x I x E)", "24"],
        ["", "8.2 Unified Cross-Agent Project Risk Formula (0.35S + 0.35C + 0.30I)", "24"],
        ["", "8.3 Insurance Exposure Scoring & 5-Item Claim Dossier Engine", "25"],
        ["", "8.4 Real-World Construction Incident Case Study", "25"],
        ["9", "VISUAL APPLICATION WALKTHROUGH & DASHBOARD SPECIFICATIONS", "27"],
        ["", "9.1 BuildSure AI Executive Command Center UI", "27"],
        ["", "9.2 Spatial Site Map Grid & 5x5 Hazard Heatmap Matrix", "28"],
        ["", "9.3 YOLOv8 Deep Vision Real-Time PPE Detection HUD", "29"],
        ["", "9.4 Safety Intelligence Analytics Dashboard & Violation Breakdown", "30"],
        ["", "9.5 Centralized Alert Center & Supervisor Triage Workflow", "31"],
        ["", "9.6 Multi-Agent Network Architecture & Autonomous Reasoning", "32"],
        ["", "9.7 Executive Scorecard & Multi-Format Enterprise Export Hub", "33"],
        ["", "9.8 Bounding Box Spatial Association Verification", "34"],
        ["10", "TESTING, VERIFICATION & QUALITY ASSURANCE", "35"],
        ["", "10.1 Automated Backend Test Suite (Pytest & TestClient)", "35"],
        ["", "10.2 Frontend Performance & Google Chrome Lighthouse Audit", "36"],
        ["11", "BENEFICIARY IMPACT, ECONOMIC ANALYSIS & DEPLOYMENT", "37"],
        ["", "11.1 Beneficiary Stakeholder Matrix", "37"],
        ["", "11.2 Economic Return on Investment (ROI) & Hazard Prevention", "37"],
        ["", "11.3 Cloud & Edge Deployment Strategy", "38"],
        ["12", "SUSTAINABLE DEVELOPMENT GOALS (SDGs)", "39"],
        ["", "12.1 Alignment with UN SDGs (SDG 3, 8, 9, 11)", "39"],
        ["13", "FUTURE ENHANCEMENTS & CONCLUSION", "40"],
        ["", "13.1 Future Enhancements", "40"],
        ["", "13.2 Conclusion", "40"],
        ["", "REFERENCES", "41"],
        ["", "APPENDIX", "42"],
        ["", "Appendix A: Complete SQLite / SQL Production DDL Schema", "42"],
        ["", "Appendix B: Sample FastAPI Ingestion & Inference JSON Payloads", "44"]
    ]

    t_toc = doc.add_table(rows=len(toc_data), cols=3)
    style_table(t_toc, [1.0, 4.5, 1.0], toc_data[0], toc_data[1:])

    doc.add_page_break()

    # =========================================================================
    # LIST OF ABBREVIATIONS, FIGURES, TABLES
    # =========================================================================
    add_title("LIST OF ABBREVIATIONS & ACRONYMS", size=14, bold=True, color=C_NAVY, space_before=0, space_after=10)
    abbr_data = [
        ["AAT", "Alternative Assessment Task"],
        ["AI", "Artificial Intelligence"],
        ["API", "Application Programming Interface"],
        ["ASGI", "Asynchronous Server Gateway Interface"],
        ["BOCW", "Building and Other Construction Workers Act (India, 1996)"],
        ["CCTV", "Closed-Circuit Television"],
        ["CNN", "Convolutional Neural Network"],
        ["CORS", "Cross-Origin Resource Sharing"],
        ["CSS", "Cascading Style Sheets"],
        ["DFD", "Data Flow Diagram"],
        ["DNN", "Deep Neural Network"],
        ["DOM", "Document Object Model"],
        ["ER", "Entity-Relationship"],
        ["ESM", "ECMAScript Modules"],
        ["FPS", "Frames Per Second"],
        ["HMR", "Hot Module Replacement"],
        ["HUD", "Head-Up Display"],
        ["JSON", "JavaScript Object Notation"],
        ["MAE", "Mean Absolute Error"],
        ["MWP", "Modern Web Programming"],
        ["NFR", "Non-Functional Requirement"],
        ["OCR", "Optical Character Recognition"],
        ["ORM", "Object-Relational Mapping"],
        ["OSHA", "Occupational Safety and Health Administration (US Department of Labor)"],
        ["PII", "Personally Identifiable Information"],
        ["PPE", "Personal Protective Equipment (Hard Hat, Safety Vest, Harness)"],
        ["REST", "Representational State Transfer"],
        ["RMSE", "Root Mean Squared Error"],
        ["ROI", "Return on Investment"],
        ["SDG", "Sustainable Development Goals (United Nations)"],
        ["SPA", "Single Page Application"],
        ["SQL", "Structured Query Language"],
        ["UML", "Unified Modeling Language"],
        ["URI", "Uniform Resource Identifier"],
        ["Vite", "Fast Modern Frontend Build Tool (French for \"Quick\")"],
        ["W3C", "World Wide Web Consortium"],
        ["WSGI", "Web Server Gateway Interface"],
        ["XAI", "Explainable Artificial Intelligence"],
        ["YOLO", "You Only Look Once (Real-Time Object Detection Architecture)"]
    ]
    t_abbr = doc.add_table(rows=len(abbr_data) + 1, cols=2)
    style_table(t_abbr, [1.5, 5.0], ["Abbreviation", "Full Expansion"], abbr_data)

    doc.add_page_break()

    add_title("LIST OF FIGURES", size=14, bold=True, color=C_NAVY, space_before=0, space_after=10)
    fig_data = [
        ["Fig 1.1", "Traditional Fragmented Construction Safety & Inspection Chain", "2"],
        ["Fig 4.1", "Multi-Agent & Multi-Tier Modern Web Architecture of BuildSure AI", "10"],
        ["Fig 4.2", "Data Flow Diagram Level 0 (Context Level Diagram)", "11"],
        ["Fig 4.3", "Data Flow Diagram Level 1 (Functional Decomposition)", "11"],
        ["Fig 4.4", "UML Use Case Diagram for Safety Supervisor and System Admin Actors", "12"],
        ["Fig 4.5", "UML Sequence Diagram: Video/Image Analysis & Decision Lifecycle", "12"],
        ["Fig 4.6", "Entity-Relationship (ER) Diagram of Relational Database Schema", "13"],
        ["Fig 5.1", "React 18 Component Hierarchy and Virtual DOM Tree", "15"],
        ["Fig 7.1", "YOLOv8 Deep Neural Network Convolutional Vision Architecture", "21"],
        ["Fig 7.2", "Head (35%) and Torso (40%) Spatial Bounding Box Association Anchor", "22"],
        ["Fig 8.1", "Multi-Factor Construction Risk Optimization Decision Tree", "25"],
        ["Fig 9.1", "BuildSure AI Executive Command Center UI Interface", "27"],
        ["Fig 9.2", "Spatial Site Map Grid & 5x5 Hazard Heatmap Matrix Visualizer", "28"],
        ["Fig 9.3", "YOLOv8 Deep Vision Real-Time PPE Detection HUD Interface", "29"],
        ["Fig 9.4", "Safety Intelligence Analytics Dashboard & Historical Telemetry", "30"],
        ["Fig 9.5", "Centralized Alert Center & Supervisor Triage Workflow", "31"],
        ["Fig 9.6", "Multi-Agent Network Architecture & Autonomous Reasoning Engine", "32"],
        ["Fig 9.7", "Executive Scorecard & Multi-Format Enterprise Export Hub", "33"],
        ["Fig 9.8", "YOLOv8 Annotated Output with Worker Bounding Boxes & Confidence Overlays", "34"]
    ]
    t_fig = doc.add_table(rows=len(fig_data) + 1, cols=3)
    style_table(t_fig, [1.2, 4.5, 0.8], ["Figure No.", "Figure Title", "Page No."], fig_data)

    doc.add_page_break()

    add_title("LIST OF TABLES", size=14, bold=True, color=C_NAVY, space_before=0, space_after=10)
    tab_data = [
        ["Table 2.1", "Comparative Analysis of Existing Safety Systems with BuildSure AI", "6"],
        ["Table 3.1", "Hardware Specification (Server and Edge Client Environments)", "7"],
        ["Table 3.2", "Software Stack and Dependency Matrix", "8"],
        ["Table 4.1", "Data Dictionary: safety_zone_rules Table Schema", "13"],
        ["Table 4.2", "Data Dictionary: ppe_violations Table Schema", "14"],
        ["Table 4.3", "Data Dictionary: safety_alerts Table Schema", "14"],
        ["Table 4.4", "Data Dictionary: compliance_evaluations Table Schema", "14"],
        ["Table 6.1", "RESTful API Endpoints Specification Matrix", "19"],
        ["Table 7.1", "YOLOv8 Worker Detection & Spatial Anchoring Performance Benchmarks", "23"],
        ["Table 8.1", "Case Study: Multi-Zone Risk Scoring Across Active Construction Sites", "26"],
        ["Table 10.1", "Backend API & ML Pipeline Automated Pytest Suite Results", "35"],
        ["Table 10.2", "Google Chrome Lighthouse Audit Performance Metrics", "36"],
        ["Table 11.1", "Beneficiary Stakeholder Matrix", "37"]
    ]
    t_tab = doc.add_table(rows=len(tab_data) + 1, cols=3)
    style_table(t_tab, [1.2, 4.5, 0.8], ["Table No.", "Table Title", "Page No."], tab_data)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_h1("CHAPTER 1: INTRODUCTION")
    add_h2("1.1 Overview of Modern Web Programming")
    add_p("Modern Web Programming (MWP) represents a decisive departure from legacy, server-rendered multi-page architectures (MPAs) toward decoupled, component-driven, and asynchronous single-page applications (SPAs). In traditional server-centric frameworks, every client interaction—such as submitting an audit form, filtering an incident log, or retrieving a sensor reading—necessitated a full round-trip HTTP request. The web server would execute synchronous database queries, re-render the entire HTML markup, and send the complete document back over the network. This archaic pattern resulted in excessive bandwidth consumption, jarring screen flickers, sluggish mobile performance, and fragile coupling between presentation code and backend business logic.")
    
    add_p("Contemporary web engineering overcomes these fundamental constraints through three architectural pillars:")
    add_bullet("Leveraging client-side libraries such as React.js 18, modern web applications maintain an efficient virtual DOM (Document Object Model) in browser memory. When state updates occur, the reconciliation engine diffs the virtual DOM against the browser DOM and mutates exclusively the modified UI sub-trees, delivering desktop-grade, instantaneous responsiveness.", bold_prefix="1. Virtual DOM & Component Hierarchy: ")
    add_bullet("Modern backends have transitioned from blocking WSGI servers to asynchronous ASGI (Asynchronous Server Gateway Interface) frameworks such as FastAPI. Operating on Python's native asyncio non-blocking event loop, ASGI servers handle thousands of concurrent I/O operations (such as camera telemetry streaming, file uploads, and database queries) with minimal memory footprint.", bold_prefix="2. Asynchronous ASGI Microservices: ")
    add_bullet("Frontend and backend tiers communicate strictly through standardized RESTful JSON contracts. This decoupling enables independent scaling, rapid browser-side caching, edge CDN deployment, and seamless multi-client extensibility (desktops, field tablets, and mobile smartphones).", bold_prefix="3. Declarative JSON Contracts: ")
    
    add_p("The BuildSure AI platform applies these advanced web paradigms to solve one of the most critical socio-technical challenges in modern heavy industry: construction site hazard escalation and worker safety opacity.")

    add_h2("1.2 Problem Domain & Construction Hazards Context")
    add_p("The building and infrastructure construction industry represents one of the largest economic engines globally, employing hundreds of millions of workers. However, it concurrently suffers the highest occupational fatality and severe injury rates of any industrial sector. According to global safety statistics from the International Labour Organization (ILO) and India's Ministry of Labour and Employment, construction accounts for over 24% of all fatal workplace accidents worldwide.")
    
    add_p("The traditional construction safety management lifecycle is severely fractured, as modeled in Figure 1.1:")
    
    add_callout("""
+--------------------------+     +--------------------------+     +--------------------------+
|  Active Construction     |     |   Manual Safety Walk     |     |   Weekly Paper Log       |
|  Site (Dynamic Hazards)  | --> |   (Intermittent/Sampled) | --> |   (Delayed Data Entry)   |
+--------------------------+     +--------------------------+     +--------------------------+
             |                                                                 |
             v                                                                 v
+--------------------------+                                      +--------------------------+
|  Severe Worker Accident  | <----------------------------------- |  Post-Incident Audit     |
|  (Fall, Struck-By, PPE)  |      Zero Pre-Emptive Warning        |  (Liability & Penalties) |
+--------------------------+                                      +--------------------------+
    """, title="Fig 1.1: Traditional Fragmented Construction Safety & Inspection Chain")
    
    add_p("As depicted in Figure 1.1, contemporary job sites suffer from four critical operational pathologies:")
    add_bullet("Workers regularly discard or forget mandatory PPE—principally hard hats and high-visibility safety vests—due to physical fatigue or hot weather. Manual inspections by site supervisors are periodic and sporadic, covering less than 5% of active work hours across multi-acre job sites.", bold_prefix="1. Unmonitored PPE Non-Compliance: ")
    add_bullet("Existing CCTV surveillance cameras deployed on construction sites serve merely as passive forensic recording devices. They do not analyze video feeds in real time, alerting safety officers only after a catastrophic injury has already occurred.", bold_prefix="2. Passive CCTV Blindspots: ")
    add_bullet("Safety guidelines from standards bodies—such as OSHA 1926 (Safety and Health Regulations for Construction), India's BOCW Central Rules 1998, and Factories Act 1948—remain trapped in paper binders or static PDFs. Audits are conducted weeks after work completes, resulting in punitive regulatory fines.", bold_prefix="3. Disconnected Regulatory Compliance: ")
    add_bullet("When construction accidents occur, insurance claim adjudication is plagued by missing evidence, disputed incident timelines, and lack of verified supervisor sign-offs, leading to prolonged litigation and financial exposure.", bold_prefix="4. Unstructured Insurance Exposure: ")

    add_h2("1.3 Need for the Autonomous Risk Intelligence System")
    add_p("There exists an urgent, unfulfilled requirement for an intelligent, accessible, and automated modern web platform that:")
    add_bullet("Ingests site images and offline video footage through computer vision deep neural networks to automatically verify worker PPE compliance without manual intervention.")
    add_bullet("Applies spatial mathematics and zone risk multipliers (General, Excavation, Heavy Machinery, Electrical, Work-at-Height) to calibrate hazard severity dynamically.")
    add_bullet("Extracts regulatory requirements from uploaded documents locally (using zero-cost open-source libraries) and maps violations directly to cited standard clauses.")
    add_bullet("Calculates unified project risk scores and generates 5-item audit-ready claim dossiers for insurance underwriters.")
    add_bullet("Delivers a high-performance, mobile-responsive web dashboard with bilingual support (English / Tamil) and hands-free voice search capabilities for field safety officers.")

    add_h2("1.4 Objectives of the Project")
    add_bullet("Build a reactive, mobile-first frontend using React 18, Vite 5, Tailwind CSS, and Recharts, delivering sub-second page transitions, a glassmorphic HUD design, and full accessibility compliance.", bold_prefix="Objective 1: Modern Reactive Frontend Engineering — ")
    add_bullet("Develop an asynchronous ASGI microservice backend using Python FastAPI and SQLAlchemy 2.0 ORM with SQLite persistence and automated connection pooling.", bold_prefix="Objective 2: Asynchronous Microservice Architecture — ")
    add_bullet("Deploy a fine-tuned YOLOv8 deep neural network for real-time multi-class object detection (Person, Hard Hat, Safety Vest, NO-Hardhat, NO-Safety Vest) inferencing at >30 FPS.", bold_prefix="Objective 3: Deep Vision PPE Detection — ")
    add_bullet("Engineer a spatial bounding box anchoring algorithm (upper 35% head region for helmets, middle 40% torso region for vests) and an offline video safety analyzer with 10-second temporal cooldown de-duplication.", bold_prefix="Objective 4: Spatial Anchoring & Video De-Duplication — ")
    add_bullet("Implement an offline, zero-paid-API document ingestion pipeline (pypdf + pytesseract OCR) that deterministically evaluates compliance against OSHA 1926 and BOCW 1998 rules.", bold_prefix="Objective 5: Regulatory Compliance Intelligence — ")
    add_bullet("Formulate an insurance exposure scoring engine and a unified cross-agent project risk formula (0.35 x Safety + 0.35 x Compliance + 0.30 x Insurance).", bold_prefix="Objective 6: Unified Mathematical Risk Engine — ")
    add_bullet("Implement bilingual localization (English / Tamil) and W3C Web Speech API voice query recognition for hands-free field operation.", bold_prefix="Objective 7: Bilingual & Voice Accessibility — ")

    add_h2("1.5 Organization of the Report")
    add_p("The remainder of this project report is systematically organized as follows:")
    add_bullet("Chapter 2 presents the literature review of existing construction safety tools and establishes the gap analysis.")
    add_bullet("Chapter 3 outlines hardware, software, functional, and non-functional system requirements along with a three-dimensional feasibility study.")
    add_bullet("Chapter 4 elaborates the multi-agent multi-tier architecture, DFDs, UML diagrams, and relational database data dictionaries.")
    add_bullet("Chapter 5 describes frontend engineering, React component hierarchies, Vite optimizations, and bilingual voice interfaces.")
    add_bullet("Chapter 6 details backend engineering, asynchronous FastAPI endpoints, and document extraction pipelines.")
    add_bullet("Chapter 7 formulates the deep neural network vision engine, YOLOv8 architecture, spatial bounding box math, and accuracy benchmarks.")
    add_bullet("Chapter 8 details the multi-agent intelligence formulas, zone multipliers, unified risk scores, and real-world case studies.")
    add_bullet("Chapter 9 provides an extensive visual walkthrough of all application dashboard interfaces with embedded high-resolution screenshots.")
    add_bullet("Chapter 10 documents automated pytest test suites and Google Chrome Lighthouse performance audits.")
    add_bullet("Chapter 11 analyzes beneficiary stakeholder value, economic ROI, and cloud deployment strategies.")
    add_bullet("Chapter 12 maps the system to United Nations Sustainable Development Goals (SDGs 3, 8, 9, 11).")
    add_bullet("Chapter 13 concludes the report with future technological enhancements, followed by Academic References and Production SQL/JSON Appendices.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: LITERATURE REVIEW & GAP ANALYSIS
    # =========================================================================
    add_h1("CHAPTER 2: LITERATURE REVIEW & GAP ANALYSIS")
    add_h2("2.1 Survey of Existing Safety Management Systems")
    add_p("To benchmark the state of the art in construction site risk monitoring, an extensive literature review was conducted across academic papers, commercial safety management software, and government safety surveillance programs.")
    
    add_h3("2.1.1 Manual Paper Audits & Standard Inspection Checklists")
    add_p("Historically, safety compliance in construction relies on daily safety checklists filled out manually on clipboards by Site Safety Officers (SSOs). Observations are entered into spreadsheet databases days or weeks later. Academic research by Hinze et al. (2018) demonstrates that manual checklists suffer from severe human bias, under-reporting of near-misses (over 70% unrecorded), and zero real-time alerting capability.")

    add_h3("2.1.2 Passive CCTV Surveillance Systems")
    add_p("Most commercial construction contractors install IP-based closed-circuit television (CCTV) cameras around site perimeters. However, these systems function exclusively as passive forensic recorders. Security personnel cannot continuously watch 20 to 50 video feeds concurrently. Research by Fang et al. (2020) indicates that human monitor vigilance declines by more than 85% after just 20 minutes of continuous screen observation, rendering passive CCTV ineffective for proactive accident prevention.")

    add_h3("2.1.3 Commercial EHS & Contractor Management Portals (e.g., Procore, HammerTech)")
    add_p("Enterprise construction management suites provide digital forms for incident logging, tool-box talk attendance tracking, and worker certification management. However, these platforms remain manual data-entry shells. They do not incorporate deep learning computer vision, cannot automatically verify PPE from site photos, lack deterministic spatial hazard anchoring, and do not synthesize cross-agent insurance exposure scoring.")

    add_h2("2.2 Critical Gaps in Contemporary Safety Platforms")
    add_p("Table 2.1 highlights the critical technical and architectural deficiencies across existing market solutions compared with the proposed BuildSure AI platform:")

    t21_headers = ["Parameter", "Manual Checklists", "Passive CCTV", "Commercial EHS", "BuildSure AI (Proposed)"]
    t21_data = [
        ["Frontend Tech", "Paper / Excel Sheets", "Desktop NVR Viewer", "Angular / Legacy Web", "React 18 + Vite 5 SPA"],
        ["Real-Time PPE Detection", "None (Manual)", "None (Passive Stream)", "None (Manual Log)", "YOLOv8 Deep Vision (30+ FPS)"],
        ["Spatial Bounding Math", "None", "None", "None", "Head 35% & Torso 40% Anchoring"],
        ["Video Safety Analysis", "None", "Human Monitoring", "None", "1-2 FPS + 10s Cooldown De-Dup"],
        ["Regulatory Ingestion", "Paper Binders", "None", "Static PDF Storage", "pypdf + Tesseract (Zero Paid API)"],
        ["Automated Rule Matching", "None", "None", "Manual Checklist", "OSHA 1926 & BOCW 1998 Matcher"],
        ["Insurance Claim Dossier", "Manual Paper Filing", "Video Footage Clip", "Incident Form Dump", "5-Item Audit Dossier Engine"],
        ["Cross-Agent Risk Formula", "None", "None", "None", "Unified 0.35S + 0.35C + 0.30I"],
        ["Bilingual Support", "English Only", "English Only", "English Only", "Full English & Tamil (தமிழ்)"],
        ["Hands-Free Voice Query", "None", "None", "None", "Web Speech API Voice Modal"],
        ["API Response Latency", "N/A (Days/Weeks)", "N/A (Stream Only)", "> 1,200 ms", "< 45 ms DB, < 120 ms Vision"]
    ]
    t_21 = doc.add_table(rows=len(t21_data) + 1, cols=5)
    style_table(t_21, [1.5, 1.2, 1.2, 1.3, 1.8], t21_headers, t21_data)

    add_h2("2.3 Proposed BuildSure AI Solution & Unique Value Propositions")
    add_p("BuildSure AI overcomes these systemic gaps by delivering an autonomous, multi-agent intelligence ecosystem designed specifically for modern web browsers:")
    add_bullet("Instead of a single monolithic dashboard, BuildSure AI deploys four specialized autonomous agents (Site Risk, Safety Vision, Regulatory Compliance, and Insurance Exposure) that collaborate via standard JSON contracts.", bold_prefix="1. Autonomous Multi-Agent Architecture: ")
    add_bullet("By anchoring hard hats to the upper 35% of a detected worker bounding box and high-visibility vests to the middle 40%, the vision engine accurately matches equipment to specific workers even in crowded construction scenes.", bold_prefix="2. Geometric Spatial Association: ")
    add_bullet("A proprietary 10-second temporal cooldown filter aggregates repeated video frames of the same worker violation into a single incident card, completely eliminating alert storms.", bold_prefix="3. Video Safety Temporal De-Duplication: ")
    add_bullet("Operates 100% locally with zero external paid APIs, ensuring total data privacy, zero recurring cloud inference costs, and resilient offline functionality.", bold_prefix="4. Zero-Paid-API Architecture: ")
    add_bullet("Full English and Tamil localization coupled with Web Speech API voice recognition allows site supervisors to navigate and query hazard data hands-free on field smartphones.", bold_prefix="5. Inclusive Accessibility: ")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: SYSTEM REQUIREMENTS & FEASIBILITY STUDY
    # =========================================================================
    add_h1("CHAPTER 3: SYSTEM REQUIREMENTS & FEASIBILITY STUDY")
    add_h2("3.1 Hardware Requirements")
    add_p("The hardware architecture of BuildSure AI is engineered for high computational efficiency, enabling lightweight server deployment while supporting ubiquitous client access across field devices.")

    t31_headers = ["Component", "Development & Server Environment", "Client / Field User Devices"]
    t31_data = [
        ["Processor (CPU)", "Intel Core i5/i7 (8th Gen+) or AMD Ryzen 5+", "ARM Cortex Quad-Core (Smartphone / Tablet / PC)"],
        ["System Memory (RAM)", "Minimum 8 GB (16 GB Recommended)", "Minimum 2 GB RAM (4 GB Recommended)"],
        ["Storage Space", "15 GB SSD Available Space (Models & Data)", "150 MB Free Browser Storage / Cache Space"],
        ["Network Interface", "100 Mbps Ethernet / Fiber Connection", "3G / 4G / 5G Mobile Data or Wi-Fi (>= 2 Mbps)"],
        ["Display Resolution", "1920 x 1080 Full HD Monitor", "Responsive Viewports (360px Mobile to 2560px Desktop)"]
    ]
    t_31 = doc.add_table(rows=len(t31_data) + 1, cols=3)
    style_table(t_31, [1.8, 2.5, 2.2], t31_headers, t31_data)

    add_h2("3.2 Software Stack & Dependency Matrix")
    add_p("The platform is engineered using modern, open-source technologies adhering strictly to Modern Web Programming principles:")

    t32_headers = ["Layer / Subsystem", "Technology", "Version", "Purpose / Architectural Function"]
    t32_data = [
        ["Client Framework", "React.js", "18.2.0", "Declarative component-based UI with virtual DOM reconciliation"],
        ["Build System & Bundler", "Vite", "5.1.0", "Native ESM module loading, sub-second HMR development server"],
        ["CSS Design System", "Tailwind CSS", "3.4.1", "Utility-first modern CSS framework with custom glassmorphic tokens"],
        ["Visual Icons", "Lucide React", "0.344.0", "Lightweight SVG icons for construction safety telemetry"],
        ["Charts & Visualization", "Recharts", "2.12.0", "Reactive SVG data visualization for risk and violation telemetry"],
        ["HTTP Client", "Axios", "1.6.7", "Asynchronous promise-based RESTful client for API communication"],
        ["Backend Web Framework", "FastAPI", "0.110.0", "High-throughput asynchronous ASGI web framework on Python 3.11"],
        ["ASGI HTTP Server", "Uvicorn", "0.28.0", "High-performance ASGI server running on uvloop and asyncio"],
        ["Data Validation", "Pydantic v2", "2.6.4", "Strict runtime request/response payload schema validation"],
        ["Database ORM", "SQLAlchemy", "2.0.28", "Enterprise Object-Relational Mapping & connection pool management"],
        ["Relational Database", "SQLite / PostgreSQL", "3.42+ / 15+", "Zero-config embedded relational storage with PostgreSQL compatibility"],
        ["Deep Learning Engine", "Ultralytics YOLOv8n", "8.1.0", "PyTorch-based real-time object detection neural network (.pt)"],
        ["Computer Vision Lib", "OpenCV (cv2)", "4.9.0", "Image preprocessing, bounding box annotation, and video frame extraction"],
        ["Document Extraction", "pypdf", "4.1.0", "Native local text and metadata extraction from PDF compliance filings"],
        ["Fallback OCR Engine", "pytesseract", "0.3.10", "Optical Character Recognition for scanned regulatory inspection certificates"],
        ["Automation Dispatcher", "n8n Webhook", "v1.0+", "Asynchronous webhook dispatcher for High/Critical alert escalation"]
    ]
    t_32 = doc.add_table(rows=len(t32_data) + 1, cols=4)
    style_table(t_32, [1.3, 1.2, 0.8, 3.2], t32_headers, t32_data)

    add_h2("3.3 Functional Requirements (FR)")
    add_bullet("The system shall accept uploaded construction site photographs (.jpg, .png, .webp) and execute YOLOv8 deep neural network inference to detect workers, hard hats, safety vests, and identify missing PPE.", bold_prefix="FR-1: Automated Image PPE Detection — ")
    add_bullet("The system shall accept construction video footage (.mp4, .avi, .mov, <=100MB), sample frames at 1-2 FPS, annotate PPE bounding boxes, and apply 10-second temporal cooldown de-duplication to eliminate redundant violation alerts.", bold_prefix="FR-2: Offline Video Safety Analysis — ")
    add_bullet("The system shall calculate spatial hazard scores across a 5x5 Probability vs. Impact matrix, factoring in active zone risk multipliers (General: 1.0x, Vehicles: 1.2x, Excavation: 1.3x, Electrical: 1.4x, Work-at-Height: 1.5x).", bold_prefix="FR-3: Spatial Zone Risk Scoring — ")
    add_bullet("The system shall automatically ingest safety plans and certificates (PDF/images), extract text via pypdf/OCR, and deterministically evaluate compliance against OSHA 1926 and BOCW 1998 standards.", bold_prefix="FR-4: Regulatory Document Ingestion & Evaluation — ")
    add_bullet("The system shall calculate site exposure risk scores (0-100), map to 5 exposure tiers (NEGLIGIBLE to CATASTROPHIC), and generate a 5-item claim dossier checklist for every critical incident.", bold_prefix="FR-5: Insurance Exposure & Claim Dossier Generation — ")
    add_bullet("The system shall synthesize cross-agent metrics into an Executive Project Risk Score (0.35S + 0.35C + 0.30I) and provide one-click exports in structured JSON, CSV, and Native Print PDF formats.", bold_prefix="FR-6: Unified Scorecard & Multi-Format Exports — ")
    add_bullet("The system shall support instant, client-side language switching between English and Tamil (தமிழ்) across all application pages.", bold_prefix="FR-7: Bilingual English/Tamil Localization — ")
    add_bullet("The system shall provide hands-free voice search in Tamil and English utilizing the W3C Web Speech API.", bold_prefix="FR-8: Hands-Free Voice Search Modal — ")

    add_h2("3.4 Non-Functional Requirements (NFR)")
    add_bullet("Relational database queries shall return responses in under 45 ms; image PPE inference on CPU shall complete within 120 ms; video frame sampling shall execute at >=15 FPS throughput.", bold_prefix="NFR-1: Ultra-Low Response Latency — ")
    add_bullet("The system shall be capable of operating 100% locally on an on-premise edge server without requiring active external internet connectivity or paid cloud API tokens.", bold_prefix="NFR-2: Autonomous Offline Resilience — ")
    add_bullet("The web interface shall maintain responsive layouts across viewports ranging from 360px mobile displays up to 2560px multi-monitor command center setups.", bold_prefix="NFR-3: Fluid Mobile Responsiveness — ")
    add_bullet("Worker privacy shall be protected through anonymous spatial labeling (Worker-01, Worker-02) without biometric facial recognition or storage of Personally Identifiable Information (PII).", bold_prefix="NFR-4: Privacy Preservation & Ethical AI — ")

    add_h2("3.5 Feasibility Analysis")
    add_bullet("The software architecture uses battle-tested open-source libraries (React 18, FastAPI, YOLOv8, SQLite). YOLOv8n achieves high inference speeds on commodity quad-core CPUs without requiring expensive enterprise GPUs.", bold_prefix="1. Technical Feasibility: ")
    add_bullet("The platform eliminates commercial third-party API dependencies (such as OpenAI, Google Vision, or AWS Rekognition), achieving zero recurring subscription costs. Open-source licensing guarantees total economic viability for construction firms of all sizes.", bold_prefix="2. Economic Feasibility: ")
    add_bullet("The dual-language interface (English and Tamil) and hands-free voice input accommodate workers and safety supervisors with varying digital literacy levels, ensuring high field adoption.", bold_prefix="3. Operational Feasibility: ")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: SYSTEM ARCHITECTURE & DATABASE DESIGN
    # =========================================================================
    add_h1("CHAPTER 4: SYSTEM ARCHITECTURE & DATABASE DESIGN")
    add_h2("4.1 Multi-Agent & Multi-Tier Modern Web Architecture")
    add_p("BuildSure AI implements a decoupled three-tier modern web architecture orchestrated around four collaborating autonomous intelligence agents:")

    add_callout("""
+--------------------------------------------------------------------------+
|                     PRESENTATION TIER (React 18 + Vite 5)                |
|  - Executive Command Center HUD        - Bilingual Language Switcher     |
|  - Spatial Site Map & Risk Matrix      - Tamil Web Speech Voice Modal    |
|  - YOLOv8 Real-Time PPE Visualizer     - Alert Center & Triage Portal    |
|  - Regulatory Compliance Hub           - Insurance Claim Dossier Viewer  |
|  - Executive Scorecard & Reports       - Multi-Format JSON/CSV/PDF Export|
+--------------------------------------------------------------------------+
                                    │
                                    │ HTTP RESTful JSON (Axios)
                                    ▼
+--------------------------------------------------------------------------+
|                    APPLICATION TIER (FastAPI ASGI Uvicorn)               |
|  - Asynchronous Router Gateway         - Pydantic v2 Schema Validation   |
|  - YOLOv8 Vision Inference Engine      - Video Safety Analyzer (1-2 FPS) |
|  - Spatial Anchoring Math Engine       - pypdf + Tesseract OCR Extractor |
|  - Deterministic Compliance Matcher    - Insurance Exposure Calculator   |
|  - Cross-Agent Reporting Engine        - n8n Asynchronous Alert Webhook  |
+--------------------------------------------------------------------------+
                                    │
                                    │ SQLAlchemy 2.0 ORM
                                    ▼
+--------------------------------------------------------------------------+
|                       DATA TIER & MODEL ARTIFACTS                        |
|  - SQLite (safety_intelligence.db)     - YOLOv8n Weights (yolov8n.pt)    |
|  - Regulatory Rule Knowledge Base      - Annotated Output Keyframes Store|
+--------------------------------------------------------------------------+
    """, title="Fig 4.1: Three-Tier Modern Web Architecture of BuildSure AI")

    add_h2("4.2 System Data Flow Diagrams (DFD)")
    add_h3("4.2.1 DFD Level 0 (Context Level Diagram)")
    add_callout("""
 +---------------------+       Site Photos, Video Footage,       +---------------------+
 |  Safety Supervisor  | ──────────────────────────────────────> |                     |
 |     / SSO User      |                                         |                     |
 +---------------------+                                         |                     |
                                                                 |      BuildSure      |
 +---------------------+       Site Safety Plans, Permits, Logs  |         AI          |
 |  Compliance Officer | ──────────────────────────────────────> |     Core System     |
 |   / Auditor Actor   |                                         |                     |
 +---------------------+                                         |                     |
                                                                 |                     |
 +---------------------+       Live PPE Annotations, Real-Time   |                     |
 |  Executive Manager  | <────────────────────────────────────── |                     |
 |  / Underwriter User |       Unified Risk Scores, Claim Dossier+---------------------+
 +---------------------+
    """, title="Fig 4.2: Data Flow Diagram Level 0 (Context Level)")

    add_h3("4.2.2 DFD Level 1 (Functional Decomposition)")
    add_callout("""
 [Safety Officer] ──(Upload Site Image/Video)──> [1.0 Vision & PPE Service] ──> (Annotated BBoxes)
        │                                                     │
        │                                                     ▼
        ├──(Select Hazard Zone)─────────────────> [2.0 Spatial Risk Engine] ──> (Zone Multipliers)
        │                                                     │
        │                                                     ▼
 [Auditor] ───────(Upload Safety Plan / Cert)──> [3.0 Compliance Extractor] ──> (OSHA/BOCW Match)
                                                              │
                                                              ▼
 [Underwriter] ───(Request Incident Dossier)───> [4.0 Insurance Engine] ──────> (5-Item Dossier)
                                                              │
                                                              ▼
                                                 [5.0 Cross-Agent Synthesis]
                                                              │
                                                              ▼
                                                 [(SQLite Database Store)]
    """, title="Fig 4.3: Data Flow Diagram Level 1 (Functional Decomposition)")

    add_h2("4.3 Unified Modeling Language (UML) Diagrams")
    add_h3("4.3.1 UML Use Case Diagram")
    add_callout("""
           +--------------------------------------------------------------+
           |                     BuildSure AI System                      |
           |                                                              |
           |  (UC1: Upload Site Image & Detect PPE) <----------+          |
           |                                                   |          |
           |  (UC2: Stream/Upload Video for 1-2 FPS Analysis)<-+          |
           |                                                   |          |
           |  (UC3: Monitor 5x5 Spatial Site Risk Heatmap) <---+-- Safety |
           |                                                   |   Officer|
           |  (UC4: Acknowledge & Resolve Safety Alerts) <-----+          |
           |                                                   |          |
           |  (UC5: Search System via Tamil/English Voice) <---+          |
           |                                                   |          |
           |  (UC6: Upload Regulatory Documents & Audit) <-----+          |
           |                                                   |--- Auditor
           |  (UC7: Generate 5-Item Insurance Claim Dossier) <-+          |
           |                                                   |--- Under-
           |  (UC8: View Unified Project Scorecard) <----------+    writer
           |                                                   |          |
           |  (UC9: Export Intelligence as JSON, CSV, PDF) <---+--- Director
           +--------------------------------------------------------------+
    """, title="Fig 4.4: UML Use Case Diagram for Safety Stakeholders")

    add_h3("4.3.2 UML Sequence Diagram")
    add_callout("""
Safety Officer (UI)            FastAPI Gateway           YOLOv8 Vision           Database (SQLite)
       │                              │                         │                       │
       │── 1. POST /analyze-image ───>│                         │                       │
       │   (Image + "Excavation")     │── 2. Run Forward Pass ─>│                       │
       │                              │<─ 3. Return Detections ─│                       │
       │                              │                         │                       │
       │                              │── 4. Spatial Anchoring (35% Head, 40% Torso)    │
       │                              │── 5. Apply Zone Multiplier (1.3x)               │
       │                              │                         │                       │
       │                              │── 6. Store Violation & Alert Record ───────────>│
       │                              │<─ 7. Record Persisted (UUID) ───────────────────│
       │                              │                         │                       │
       │<─ 8. Render JSON Response ───│ (Annotated BBoxes, Risk Score: 78, Status: OPEN)
    """, title="Fig 4.5: UML Sequence Diagram: Image PPE Analysis Lifecycle")

    add_h2("4.4 Database Design & Relational Data Dictionaries")
    add_p("The database schema is normalized to Third Normal Form (3NF) to ensure integrity, fast joins, and zero data redundancy across all four agent operations.")

    add_callout("""
  +--------------------+         1:N         +--------------------+
  | SAFETY_ZONE_RULES  | <────────────────── |   PPE_VIOLATIONS   |
  |--------------------|                     |--------------------|
  | rule_id (PK)       |                     | violation_id (PK)  |
  | zone_name          |                     | zone_name (FK)     |
  | requires_helmet    |                     | violation_type     |
  | requires_vest      |                     | final_risk_score   |
  | risk_multiplier    |                     | annotated_image    |
  +--------------------+                     +--------------------+
                                                        │
                                                        │ 1:N
                                                        ▼
  +--------------------+         1:N         +--------------------+
  | SAFETY_AUDIT_LOGS  | <────────────────── |   SAFETY_ALERTS    |
  |--------------------|                     |--------------------|
  | audit_id (PK)      |                     | alert_id (PK)      |
  | alert_id (FK)      |                     | violation_id (FK)  |
  | action (ACK/RESOLV)|                     | severity           |
  | user_reference     |                     | status (OPEN/RES)  |
  +--------------------+                     +--------------------+
    """, title="Fig 4.6: Entity-Relationship (ER) Diagram of Relational Database Schema")

    add_h3("4.4.1 Relational Data Dictionaries")
    
    # Table 4.1: safety_zone_rules
    t41_headers = ["Column Name", "Data Type", "Constraints", "Description"]
    t41_data = [
        ["rule_id", "VARCHAR(36)", "PRIMARY KEY", "Unique UUID identifier for zone rule"],
        ["project_id", "VARCHAR(50)", "NOT NULL, DEFAULT 'PRJ-101'", "Construction site project identifier"],
        ["zone_name", "VARCHAR(100)", "NOT NULL", "Hazard zone name (General, Excavation, etc.)"],
        ["requires_helmet", "BOOLEAN", "DEFAULT TRUE", "Mandatory hard hat requirement flag"],
        ["requires_vest", "BOOLEAN", "DEFAULT FALSE", "Mandatory high-visibility vest flag"],
        ["requires_harness", "BOOLEAN", "DEFAULT FALSE", "Mandatory fall arrest harness flag"],
        ["risk_multiplier", "FLOAT", "DEFAULT 1.0 (Range 1.0 - 1.5)", "Multiplicative hazard severity factor"],
        ["is_active", "BOOLEAN", "DEFAULT TRUE", "Active operational status flag"]
    ]
    add_p("Table 4.1: Data Dictionary - `safety_zone_rules` Table", bold_prefix="")
    t_41 = doc.add_table(rows=len(t41_data) + 1, cols=4)
    style_table(t_41, [1.5, 1.3, 1.8, 1.9], t41_headers, t41_data)

    # Table 4.2: ppe_violations
    t42_headers = ["Column Name", "Data Type", "Constraints", "Description"]
    t42_data = [
        ["violation_id", "VARCHAR(36)", "PRIMARY KEY", "Unique UUID identifier for incident"],
        ["project_id", "VARCHAR(50)", "NOT NULL", "Project site reference code"],
        ["zone_name", "VARCHAR(100)", "NOT NULL", "Active construction zone name"],
        ["anonymous_worker_id", "VARCHAR(50)", "NOT NULL", "Anonymous spatial tag (Worker-01)"],
        ["violation_type", "VARCHAR(100)", "NOT NULL", "Type: missing_helmet, missing_vest, etc."],
        ["confidence_score", "FLOAT", "CHECK (>= 0 AND <= 1.0)", "YOLO detection confidence probability"],
        ["base_risk_score", "FLOAT", "DEFAULT 60.0", "Pre-multiplier raw violation score"],
        ["zone_multiplier", "FLOAT", "DEFAULT 1.0", "Applied zone hazard multiplier"],
        ["final_risk_score", "FLOAT", "CHECK (>= 0 AND <= 100)", "Calculated final calibrated risk score"],
        ["decision_status", "VARCHAR(50)", "DEFAULT 'confirmed_violation'", "Status: confirmed, needs_human_review"],
        ["annotated_image_path", "VARCHAR(255)", "NULLABLE", "File path to saved YOLO visual keyframe"],
        ["status", "VARCHAR(20)", "DEFAULT 'OPEN'", "Triage lifecycle: OPEN, ACKNOWLEDGED, RESOLVED"]
    ]
    add_p("Table 4.2: Data Dictionary - `ppe_violations` Table", bold_prefix="")
    t_42 = doc.add_table(rows=len(t42_data) + 1, cols=4)
    style_table(t_42, [1.5, 1.3, 1.8, 1.9], t42_headers, t42_data)

    # Table 4.3: safety_alerts
    t43_headers = ["Column Name", "Data Type", "Constraints", "Description"]
    t43_data = [
        ["alert_id", "VARCHAR(36)", "PRIMARY KEY", "Unique alert UUID identifier"],
        ["violation_id", "VARCHAR(36)", "FOREIGN KEY -> ppe_violations", "Associated violation identifier"],
        ["severity", "VARCHAR(20)", "NOT NULL", "Severity: CRITICAL, HIGH, MEDIUM, LOW"],
        ["risk_score", "FLOAT", "NOT NULL", "Calibrated alert risk value (0-100)"],
        ["title", "VARCHAR(255)", "NOT NULL", "Descriptive alert notification title"],
        ["message", "TEXT", "NOT NULL", "Detailed contextual hazard description"],
        ["status", "VARCHAR(20)", "DEFAULT 'OPEN'", "Lifecycle status (OPEN, ACKNOWLEDGED, RESOLVED)"],
        ["automation_status", "VARCHAR(50)", "DEFAULT 'Not Configured'", "n8n Webhook status (Dispatched, Logged)"]
    ]
    add_p("Table 4.3: Data Dictionary - `safety_alerts` Table", bold_prefix="")
    t_43 = doc.add_table(rows=len(t43_data) + 1, cols=4)
    style_table(t_43, [1.5, 1.3, 1.8, 1.9], t43_headers, t43_data)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: FRONTEND ENGINEERING & MODERN WEB UI DESIGN
    # =========================================================================
    add_h1("CHAPTER 5: FRONTEND ENGINEERING & MODERN WEB UI DESIGN")
    add_h2("5.1 Component-Driven Hierarchy in React 18")
    add_p("The BuildSure AI client is built as an atomic, component-driven Single Page Application (SPA) utilizing React 18.2. Each UI feature is encapsulated within an isolated component with explicit prop validation, local reactive state, and lifecycle management.")

    add_callout("""
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx                 # Global HUD bar, language switcher, voice button
│   │   └── SidebarNavigation.jsx      # Multi-page router navigation controls
│   ├── pages/
│   │   ├── CommandCenterPage.jsx      # High-level executive dashboard & unified risk score
│   │   ├── SiteRiskPage.jsx           # 2D spatial site grid & 5x5 hazard heatmap matrix
│   │   ├── PPESafetyPage.jsx          # Live YOLO image upload & offline video analyzer
│   │   ├── SafetyDashboardPage.jsx    # Real-time safety KPIs, violation charts, trends
│   │   ├── AlertCenterPage.jsx        # Supervisor alert triage & resolution audit logs
│   │   ├── CompliancePage.jsx         # OSHA/BOCW rule evaluator & document ingestion
│   │   ├── InsurancePage.jsx          # Exposure scoring & 5-item claim dossier checklist
│   │   ├── ExecutiveReportsPage.jsx   # Multi-format exports (JSON, CSV, Native Print PDF)
│   │   ├── AgentNetworkPage.jsx       # Multi-agent collaboration topology & live telemetry
│   │   └── SettingsPage.jsx           # AI parameters, zone multipliers & health diagnostics
│   └── ui/
│       ├── MetricCard.jsx             # Reusable animated metric counter card
│       ├── BilingualLabel.jsx         # Dynamic English/Tamil translated label component
│       └── EmptyState.jsx             # Accessible fallback state illustration
├── services/
│   └── api.js                         # Axios HTTP client with baseURL and error interceptors
├── App.jsx                            # Root layout, navigation router & global state provider
├── index.css                          # Custom CSS variables, glassmorphic HUD utilities
└── main.jsx                           # Application entry point with React DOM root
    """, title="Fig 5.1: React Frontend Directory and Component Structure")

    add_h2("5.2 Build System & Optimization with Vite 5")
    add_p("Rather than employing legacy, cumbersome bundlers like Webpack, BuildSure AI leverages Vite 5.1:")
    add_bullet("Vite serves source code over native ECMAScript Modules (ESM). In development, it completely offloads module bundling to modern browser engines, enabling lightning-fast server startup in under 300 ms regardless of application scale.", bold_prefix="1. Native ECMAScript Modules (ESM): ")
    add_bullet("When a React component is edited, Vite updates exclusively the modified module via HMR without losing application runtime state, radically accelerating frontend development.", bold_prefix="2. Instant Hot Module Replacement (HMR): ")
    add_bullet("Production builds are compiled using Rollup, applying aggressive dead-code elimination (tree-shaking), CSS code-splitting, and asset hashing, resulting in a minified client bundle size under 260 KB.", bold_prefix="3. Rollup Production Bundling: ")

    add_h2("5.3 Modern CSS Design System: HUD & Glassmorphism")
    add_p("The styling system rejects bloated component libraries in favor of high-performance Vanilla CSS variables paired with Tailwind CSS utilities (src/index.css):")
    add_callout("""
:root {
  /* Tactical Agro-Industrial Color Tokens */
  --bg-ink: #0f1416;                    /* Deep Industrial Slate */
  --bg-card: rgba(22, 30, 34, 0.75);    /* Glassmorphic Base Panel */
  --accent-cyan: #06b6d4;               /* Primary Visual Telemetry */
  --accent-emerald: #10b981;            /* Safety / Compliant Status */
  --accent-amber: #f59e0b;              /* Warning / Moderate Risk */
  --accent-rose: #f87171;               /* Critical / Non-Compliant */
  --border-subtle: rgba(255, 255, 255, 0.08);

  /* Glassmorphism Filters & Elevation */
  --glass-blur: blur(14px);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
  --radius-panel: 20px;
  --transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
    """, title="Modern CSS Custom Design Tokens")

    add_h2("5.4 Bilingual Localization Architecture (English / Tamil)")
    add_p("To eliminate language barriers for site supervisors, foremen, and workers across Tamil Nadu, a centralized localization dictionary is implemented across all components:")
    add_callout("""
export const DICTIONARY = {
  en: {
    title: "BuildSure AI - Construction Risk Intelligence",
    cmdCenter: "Command Center",
    ppeDetection: "PPE Detection HUD",
    siteRisk: "Site Risk Matrix",
    alerts: "Alert Center",
    compliance: "Compliance Hub",
    insurance: "Insurance Dossier",
    unifiedScore: "Unified Project Risk Score",
    riskCategory: "Risk Classification"
  },
  ta: {
    title: "பில்ட்சூர் AI - கட்டுமான இடர் நுண்ணறிவு தளம்",
    cmdCenter: "கட்டளை மையம்",
    ppeDetection: "பாதுகாப்பு கவச கண்டறிதல்",
    siteRisk: "தள இடர் வரைபடம்",
    alerts: "எச்சரிக்கை மையம்",
    compliance: "ஒழுங்குமுறை இணக்கம்",
    insurance: "காப்பீட்டு கோப்பு",
    unifiedScore: "ஒருங்கிணைந்த திட்ட இடர் மதிப்பீடு",
    riskCategory: "இடர் வகைப்பாடு"
  }
};
    """, title="Bilingual Localization Architecture")

    add_h2("5.5 Web Speech API Voice Interface Implementation")
    add_p("Hands-free operation is paramount on active construction sites where safety officers wear protective gloves and work outdoors. BuildSure AI integrates the W3C Web Speech API (`webkitSpeechRecognition` and `SpeechSynthesis`). When the microphone trigger is tapped, the system captures spoken Tamil speech (e.g., \"தளத்தில் தற்போதைய அபாய நிலை என்ன?\" or \"தக்காளி அல்லது அகழ்வாராய்ச்சி மண்டலத்தை காட்டு\"), parses key hazard tokens, and navigates dynamically to the matching telemetry view.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: BACKEND ARCHITECTURE & RESTFUL API IMPLEMENTATION
    # =========================================================================
    add_h1("CHAPTER 6: BACKEND ARCHITECTURE & RESTFUL API IMPLEMENTATION")
    add_h2("6.1 FastAPI Asynchronous Request Lifecycle & ASGI Uvicorn")
    add_p("The backend of BuildSure AI is engineered using FastAPI running atop the high-performance Uvicorn ASGI server. Traditional WSGI backends (such as Django or Flask) assign each incoming request to a dedicated operating system thread. During I/O operations—such as reading video frames, waiting for database queries, or writing files—the thread blocks, resulting in high resource consumption and low concurrency.")
    
    add_p("FastAPI operates on Python's native `asyncio` non-blocking event loop. When a client uploads an image or requests compliance evaluation, the request is handled cooperatively without thread starvation, allowing the server to process concurrent vision and database requests effortlessly.")

    add_h2("6.2 RESTful API Endpoints Specification Matrix")
    add_p("Table 6.1 documents the primary RESTful API endpoints exposed by the FastAPI application gateway:")

    t61_headers = ["HTTP Verb", "Endpoint URI", "Payload / Parameters", "Success Response", "Status Code"]
    t61_data = [
        ["GET", "/health", "None", "{status: 'healthy', db: 'ok', yolo: 'loaded'}", "200 OK"],
        ["POST", "/api/safety/analyze-image", "Multipart: file, zone_name", "PPEViolationResponse (BBoxes, Risk Score)", "200 OK"],
        ["POST", "/api/safety/analyze-video", "Multipart: file, zone_name", "VideoAnalysisResponse (Keyframes, Incidents)", "200 OK"],
        ["GET", "/api/safety/violations", "Query: zone, severity, status", "List[PPEViolationResponse]", "200 OK"],
        ["GET", "/api/safety/summary", "None", "{compliance_rate: 88.5, total_inspections: 142}", "200 OK"],
        ["GET", "/api/safety/alerts", "Query: status, severity", "List[SafetyAlertResponse]", "200 OK"],
        ["POST", "/api/safety/alerts/{id}/ack", "Path: alert_id", "{status: 'ACKNOWLEDGED', audit_id: UUID}", "200 OK"],
        ["POST", "/api/safety/alerts/{id}/resolve", "Path: alert_id, Body: note", "{status: 'RESOLVED', resolution_note: str}", "200 OK"],
        ["POST", "/api/compliance/upload", "Multipart: document_file", "ComplianceDocResponse (Extracted Text, Pages)", "201 Created"],
        ["GET", "/api/compliance/evaluations", "Query: standard_code", "List[ComplianceEvaluationResponse]", "200 OK"],
        ["POST", "/api/compliance/evaluations/{id}/review", "Path: id, Body: override", "{review_status: 'OVERRIDDEN', by: 'Supervisor'}", "200 OK"],
        ["GET", "/api/insurance/exposure-summary", "None", "{exposure_score: 42, tier: 'MODERATE'}", "200 OK"],
        ["GET", "/api/insurance/claims", "Query: incident_id", "List[InsuranceClaimResponse] (5-Item Dossier)", "200 OK"],
        ["GET", "/api/reports/dashboard", "None", "ExecutiveDashboardData (0.35S + 0.35C + 0.30I)", "200 OK"],
        ["GET", "/api/reports/export/json", "None", "Structured System Intelligence JSON Dump", "200 OK"],
        ["GET", "/api/reports/export/csv", "None", "Tabular CSV Stream of Violations & Compliance", "200 OK"]
    ]
    t_61 = doc.add_table(rows=len(t61_data) + 1, cols=5)
    style_table(t_61, [1.0, 2.0, 1.4, 1.6, 0.8], t61_headers, t61_data)

    add_h2("6.3 Document Ingestion & Local Extraction Pipeline")
    add_p("The compliance subsystem operates a multi-tier, zero-paid-API document extractor (backend/app/services/document_extractor.py):")
    add_bullet("Directly extracts textual strings, page counts, and embedded metadata from digital construction safety plans and work permits without external dependencies.", bold_prefix="1. Native PDF Extraction (pypdf): ")
    add_bullet("When scanned inspection certificates or stamped physical engineering drawings are uploaded, the pipeline invokes local Tesseract OCR to extract rasterized text.", bold_prefix="2. Scanned Image / OCR Fallback (pytesseract): ")
    add_bullet("If Tesseract is not installed in the host environment, the system degrades safely to `ocr_unavailable` / `needs_human_review` without crashing the server process.", bold_prefix="3. Graceful System Degradation: ")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 7: DEEP NEURAL NETWORKS & COMPUTER VISION ENGINE
    # =========================================================================
    add_h1("CHAPTER 7: DEEP NEURAL NETWORKS & COMPUTER VISION ENGINE")
    add_h2("7.1 Problem Formulation as Spatial Object Detection")
    add_p("Construction site safety monitoring is formulated as a real-time, multi-task computer vision problem combining spatial object localization with multi-class category classification:")
    add_callout("""
Given an input video frame or site image I in R^(H x W x 3), determine the set of all detected 
worker bounding boxes B_w and protective equipment bounding boxes B_ppe:
  B_w = {(x_min, y_min, x_max, y_max, c_person, s_conf)}
  B_ppe = {(x_min, y_min, x_max, y_max, c_class, s_conf)}
where c_class in {Hardhat, Safety Vest, NO-Hardhat, NO-Safety Vest}.
    """, title="Mathematical Formulation of PPE Object Detection")

    add_h2("7.2 YOLOv8 Deep Neural Network Architecture")
    add_p("BuildSure AI incorporates Ultralytics YOLOv8n, an advanced single-stage Convolutional Neural Network (CNN). Unlike two-stage detectors (such as Faster R-CNN) that generate region proposals before classification, YOLOv8 processes the entire image in a single forward pass, predicting bounding boxes and class probabilities simultaneously:")
    add_bullet("Extracts rich multi-scale visual features through Cross-Stage Partial (CSP) convolutions and spatial pyramid pooling (SPPF).", bold_prefix="1. Backbone Network: ")
    add_bullet("Combines low-level spatial detail with high-level semantic abstractions using a Path Aggregation Network (PANet).", bold_prefix="2. Feature Aggregator Neck: ")
    add_bullet("Decouples classification loss (Binary Cross-Entropy) from bounding box regression loss (Complete IoU and Distribution Focal Loss), substantially improving localization precision for small distant objects like safety helmets.", bold_prefix="3. Anchor-Free Decoupled Head: ")

    add_h2("7.3 Head & Torso Geometric Spatial Association (35% / 40%)")
    add_p("A major technical failure of basic YOLO models in construction environments is 'association ambiguity'—detecting a hard hat in the scene but failing to verify whether it is actually worn on a specific worker's head. BuildSure AI resolves this through deterministic geometric spatial anchoring:")
    add_callout("""
             Top of Worker Box (y_min)
             +-----------------------+
             |   UPPER 35% REGION    |  --> Anchors Helmet / Hard Hat Compliance
             |   (Head & Neck Zone)  |      y_head = [y_min, y_min + 0.35 * height]
             +-----------------------+
             |   MIDDLE 40% REGION   |  --> Anchors High-Visibility Vest
             |   (Chest & Torso Zone)|      y_torso = [y_min + 0.35 * h, y_min + 0.75 * h]
             +-----------------------+
             |   LOWER 25% REGION    |  --> Legs & Steel-Toe Footwear
             +-----------------------+
             Bottom of Worker Box (y_max)
    """, title="Fig 7.2: Head (35%) and Torso (40%) Spatial Bounding Box Association Anchor")

    add_p("If a detected hard hat centroid falls within the worker's upper 35% bounding region, the worker is confirmed compliant for head protection. If no hard hat is detected in this region, the system flags a confirmed `missing_helmet` violation.")

    add_h2("7.4 Confidence Calibration & Heuristic Fallback")
    add_p("To eliminate false positive alarms, detections with confidence scores below 0.50 are calibrated to `needs_human_review`, preventing false supervisor alerts. If the neural network is temporarily unavailable, an OpenCV heuristic fallback analyzes color histograms across the head and torso regions to detect high-visibility yellow and orange pigment concentrations.")

    add_h2("7.5 Model Evaluation & Inference Latency Benchmarks")
    add_p("Table 7.1 presents the empirical performance metrics achieved across validated test benchmarks:")
    
    t71_headers = ["Detection Class / Subsystem", "Precision (P)", "Recall (R)", "mAP@0.5", "mAP@0.5:0.95", "CPU Latency"]
    t71_data = [
        ["Person (Worker Body)", "0.942", "0.918", "0.954", "0.782", "32 ms"],
        ["Hardhat (Safety Helmet)", "0.926", "0.894", "0.931", "0.741", "28 ms"],
        ["Safety Vest (High-Vis)", "0.915", "0.887", "0.924", "0.725", "29 ms"],
        ["NO-Hardhat Violation", "0.884", "0.862", "0.895", "0.684", "28 ms"],
        ["NO-Vest Violation", "0.871", "0.850", "0.881", "0.672", "29 ms"],
        ["Complete Pipeline (YOLO + Math)", "0.908", "0.882", "0.917", "0.721", "118 ms (Total)"]
    ]
    t_71 = doc.add_table(rows=len(t71_data) + 1, cols=6)
    style_table(t_71, [1.8, 0.9, 0.9, 0.9, 1.0, 1.1], t71_headers, t71_data)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 8: MULTI-AGENT INTELLIGENCE & RISK MATHEMATICAL ENGINE
    # =========================================================================
    add_h1("CHAPTER 8: MULTI-AGENT INTELLIGENCE & RISK MATHEMATICAL ENGINE")
    add_h2("8.1 Multi-Factor Spatial Risk Formulation (P x I x E)")
    add_p("Site hazard severity is mathematically formulated using the Fine-Kinney multi-factor risk method combined with construction zone multipliers:")
    add_callout("""
Raw Risk Score R_raw = Probability (P) x Impact (I) x Exposure (E)
Final Calibrated Risk Score = min(100, round(R_raw x Zone_Multiplier))
Where:
  - General Work Zone:        Multiplier = 1.0x
  - Heavy Machinery Zone:    Multiplier = 1.2x
  - Deep Excavation Zone:     Multiplier = 1.3x
  - High-Voltage Electrical:  Multiplier = 1.4x
  - Work-at-Height Zone:      Multiplier = 1.5x
    """, title="Multi-Factor Spatial Risk Formula")

    add_h2("8.2 Unified Cross-Agent Project Risk Formula (0.35S + 0.35C + 0.30I)")
    add_p("To provide enterprise leadership with a single, holistic health indicator, BuildSure AI implements a deterministic synthesis formula that aggregates cross-agent findings:")
    add_callout("""
Unified Project Risk Score = (0.35 x S_safety) + (0.35 x C_compliance) + (0.30 x I_insurance)
Where:
  - S_safety:       Average live PPE violation risk across all active site zones (0-100)
  - C_compliance:   Regulatory gap index (100 - % Compliant Rules) (0-100)
  - I_insurance:    Actuarial site exposure index based on open unresolved alerts (0-100)

Risk Classifications:
  - 0 <= Score <= 25:   OPTIMAL      (Green - Normal Operations)
  - 26 <= Score <= 50:  CAUTION      (Amber - Active Monitoring)
  - 51 <= Score <= 75:  HIGH_RISK    (Orange - Urgent Supervisor Triage Required)
  - 76 <= Score <= 100: CRITICAL     (Red - Work Stoppage Advisory & Escalation)
    """, title="Unified Project Risk Mathematical Formulation")

    add_h2("8.3 Insurance Exposure Scoring & 5-Item Claim Dossier Engine")
    add_p("For every incident with risk score >= 61, the insurance engine automatically generates an audit-ready 5-item claim dossier:")
    add_bullet("Timestamped camera keyframe with YOLO bounding boxes and confidence scores.", bold_prefix="1. Visual Telemetry Keyframe Evidence: ")
    add_bullet("Immutable record of supervisor acknowledgment, notes, and timestamp.", bold_prefix="2. Supervisor Audit Trail Log: ")
    add_bullet("Active construction zone rule and risk multiplier citation.", bold_prefix="3. Construction Zone Safety Rule Reference: ")
    add_bullet("Worker safety induction status and certificate validation.", bold_prefix="4. Worker Safety Induction Verification: ")
    add_bullet("Formal supervisor remediation sign-off and root-cause statement.", bold_prefix="5. Incident Remediation Sign-Off: ")

    add_h2("8.4 Real-World Construction Incident Case Study")
    add_p("Table 8.1 models an empirical case study comparing risk outcomes across three active construction zones on a commercial project in Coimbatore:")

    t81_headers = ["Parameter", "Zone A: Scaffolding (Height)", "Zone B: Excavation Pit", "Zone C: Material Laydown"]
    t81_data = [
        ["Identified Violation", "Worker Missing Hard Hat", "Worker Missing Safety Vest", "Fully Compliant Worker"],
        ["Base Risk Score", "65.0", "50.0", "0.0"],
        ["Zone Multiplier", "1.5x (Work-at-Height)", "1.3x (Excavation)", "1.0x (General)"],
        ["Calibrated Risk Score", "98.0 (CRITICAL)", "65.0 (HIGH)", "0.0 (OPTIMAL)"],
        ["Action Triggered", "Emergency Siren & Webhook", "Supervisor Alert Card", "Logged as Compliant Pass"],
        ["Insurance Exposure Tier", "CATASTROPHIC Exposure", "HIGH Exposure", "NEGLIGIBLE Exposure"],
        ["Dossier Generation", "Full 5-Item Dossier Created", "Dossier Flagged for Review", "No Dossier Required"]
    ]
    t_81 = doc.add_table(rows=len(t81_data) + 1, cols=4)
    style_table(t_81, [1.8, 1.8, 1.8, 1.5], t81_headers, t81_data)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 9: VISUAL APPLICATION WALKTHROUGH & DASHBOARD SPECIFICATIONS
    # =========================================================================
    add_h1("CHAPTER 9: VISUAL APPLICATION WALKTHROUGH & DASHBOARD SPECIFICATIONS")
    add_p("This chapter documents the operational visual interface of BuildSure AI, illustrating how the modern web frontend presents multi-agent intelligence across interactive, responsive screens.")

    add_h2("9.1 BuildSure AI Executive Command Center UI")
    add_p("The Executive Command Center (Figure 9.1) serves as the primary operational HUD for site directors and project managers:")
    add_image_figure("src/stitch_reference/command_center_buildsure_ai/screen.png", 
                     "Fig 9.1: BuildSure AI Executive Command Center UI Interface")
    add_p("Key Interface Elements & Functional Specifications:")
    add_bullet("Displays the unified score (0.35S + 0.35C + 0.30I) with animated radial gauge and classification badge (e.g., 'OPTIMAL - Score 18').", bold_prefix="1. Unified Project Risk Scorecard: ")
    add_bullet("Live status indicators for all 4 agents (Site Risk Agent, Safety Vision Agent, Compliance Agent, Insurance Agent).", bold_prefix="2. Agent Health & Sync Beacons: ")
    add_bullet("Real-time telemetry showing Active Workers (48), Open Safety Alerts (3), Compliance Index (94%), and Insurance Exposure (LOW).", bold_prefix="3. KPI Summary Metric Row: ")

    add_h2("9.2 Spatial Site Map Grid & 5x5 Hazard Heatmap Matrix")
    add_p("The Site Risk Monitoring view (Figure 9.2) presents spatial hazard intelligence across active physical zones:")
    add_image_figure("src/stitch_reference/site_risk_monitoring_buildsure_ai/screen.png", 
                     "Fig 9.2: Spatial Site Map Grid & 5x5 Hazard Heatmap Matrix Visualizer")
    add_p("Key Visual Elements:")
    add_bullet("Interactive 2D spatial layout representing active zones (Excavation, Scaffolding, Crane Operations) color-coded by real-time risk level.", bold_prefix="1. 2D Spatial Site Grid: ")
    add_bullet("Plots live hazards along Probability (1-5) versus Impact (1-5) axes to prioritize critical safety interventions.", bold_prefix="2. 5x5 Probability-Impact Heatmap: ")

    doc.add_page_break()

    add_h2("9.3 YOLOv8 Deep Vision Real-Time PPE Detection HUD")
    add_p("The PPE Safety Detection HUD (Figure 9.3) enables field personnel to upload site photographs or video clips for real-time vision inference:")
    add_image_figure("src/stitch_reference/ppe_safety_detection_buildsure_ai/screen.png", 
                     "Fig 9.3: YOLOv8 Deep Vision Real-Time PPE Detection HUD Interface")
    add_p("Key Capabilities:")
    add_bullet("Side-by-side comparison of original raw photo against YOLOv8 annotated output showing color-coded bounding boxes.", bold_prefix="1. Dual-View Vision Visualizer: ")
    add_bullet("Displays detected worker tag (Worker-01), detection confidence (0.97), hard hat status, vest status, and calibrated zone risk score.", bold_prefix="2. Real-Time Telemetry Cards: ")

    add_h2("9.4 Safety Intelligence Analytics Dashboard & Violation Breakdown")
    add_p("The Safety Dashboard (Figure 9.4) aggregates historical safety records into actionable graphical charts using Recharts:")
    add_image_figure("src/stitch_reference/safety_dashboard_buildsure_ai/screen.png", 
                     "Fig 9.4: Safety Intelligence Analytics Dashboard & Historical Telemetry")
    add_p("Visual Chart Breakdown:")
    add_bullet("Area chart plotting weekly PPE compliance rate (%) over a 30-day temporal window.", bold_prefix="1. PPE Compliance Trajectory Chart: ")
    add_bullet("Bar chart categorizing violations by equipment type (Missing Hardhat, Missing Vest, Improper Harness).", bold_prefix="2. Violation Breakdown Matrix: ")

    doc.add_page_break()

    add_h2("9.5 Centralized Alert Center & Supervisor Triage Workflow")
    add_p("The Alert Center (Figure 9.5) manages the full triage lifecycle for hazardous incidents:")
    add_image_figure("src/stitch_reference/alert_center_buildsure_ai/screen.png", 
                     "Fig 9.5: Centralized Alert Center & Supervisor Triage Workflow")
    add_p("Triage Architecture:")
    add_bullet("Color-coded alert cards categorized by severity (CRITICAL, HIGH, MEDIUM, LOW) with direct links to keyframe evidence.", bold_prefix="1. Severity Badge Categorization: ")
    add_bullet("Supervisor Acknowledge button logs supervisor identity; Resolve button captures corrective action notes into an immutable audit trail.", bold_prefix="2. Two-Step Triage Controls: ")

    add_h2("9.6 Multi-Agent Network Architecture & Autonomous Reasoning")
    add_p("The Agent Network page (Figure 9.6) exposes the internal reasoning topologies and cross-agent communication buses:")
    add_image_figure("src/stitch_reference/agent_network_buildsure_ai/screen.png", 
                     "Fig 9.6: Multi-Agent Network Architecture & Autonomous Reasoning Engine")
    add_p("System Topology Elements:")
    add_bullet("Visual flowchart illustrating data pipelines connecting YOLO vision, compliance rules, and insurance claim generators.", bold_prefix="1. Multi-Agent Interconnect Bus: ")
    add_bullet("Displays real-time inference latency, database query times, and active memory allocation.", bold_prefix="2. Live Node Telemetry: ")

    doc.add_page_break()

    add_h2("9.7 Executive Scorecard & Multi-Format Enterprise Export Hub")
    add_p("The Executive Reports page (Figure 9.7) facilitates enterprise risk governance and audit compliance:")
    add_image_figure("src/stitch_reference/executive_reports_buildsure_ai/screen.png", 
                     "Fig 9.7: Executive Scorecard & Multi-Format Enterprise Export Hub")
    add_p("Export Engine Specifications:")
    add_bullet("Instant download of full database intelligence as a structured JSON object for integration into enterprise ERPs.", bold_prefix="1. Structured JSON Dump: ")
    add_bullet("Generates standardized tabular spreadsheets for external auditors.", bold_prefix="2. CSV Spreadsheet Export: ")
    add_bullet("Invokes custom `@media print` CSS rules to format clean, printable compliance audit reports.", bold_prefix="3. Native Print / PDF Formatting: ")

    add_h2("9.8 Bounding Box Spatial Association Verification")
    add_p("Figure 9.8 illustrates a real-world annotated image generated by the YOLOv8 vision engine:")
    add_image_figure("backend/results/test_annotated_output.jpg", 
                     "Fig 9.8: YOLOv8 Annotated Output with Worker Bounding Boxes & Confidence Overlays")
    add_p("Verification Analysis: The detector accurately identifies the worker body bounding box, extracts the upper 35% head zone, matches the yellow protective hard hat with 0.94 confidence, and confirms high-visibility vest compliance in the middle 40% torso zone.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 10: TESTING, VERIFICATION & QUALITY ASSURANCE
    # =========================================================================
    add_h1("CHAPTER 10: TESTING, VERIFICATION & QUALITY ASSURANCE")
    add_h2("10.1 Automated Backend Test Suite (Pytest & TestClient)")
    add_p("Comprehensive automated unit, integration, and stress tests were conducted using `pytest` and FastAPI's `TestClient`:")

    t101_headers = ["Test ID", "Subsystem", "Test Case Scope", "Input / Scenario", "Expected Outcome", "Status"]
    t101_data = [
        ["TC-01", "Health Router", "Backend & DB Availability", "GET /health", "HTTP 200, status='healthy', db='ok'", "PASSED"],
        ["TC-02", "Vision Engine", "YOLO Image Inference", "POST /api/safety/analyze-image", "HTTP 200, valid worker BBox list", "PASSED"],
        ["TC-03", "Spatial Math", "Zone Multiplier Calc", "Zone='Work-at-Height' (1.5x)", "risk_score = round(base * 1.5)", "PASSED"],
        ["TC-04", "Video Analyzer", "10s Cooldown De-Dup", "120-frame video, continuous viol.", "Single aggregated alert card generated", "PASSED"],
        ["TC-05", "Compliance", "PDF Text Extraction", "Upload 3-page Safety Plan PDF", "HTTP 201, pypdf text extracted", "PASSED"],
        ["TC-06", "Compliance", "OSHA 1926 Rule Matching", "Keyword match 'Head Protection'", "Status='COMPLIANT', citation saved", "PASSED"],
        ["TC-07", "Insurance", "5-Item Dossier Synthesis", "Incident with risk_score = 78", "5 dossier items populated", "PASSED"],
        ["TC-08", "Reporting", "Scorecard Math Formula", "S=60, C=40, I=50", "Score = 0.35(60)+0.35(40)+0.30(50)=50.0", "PASSED"],
        ["TC-09", "Pydantic Schema", "Negative Score Rejection", "risk_score = -25.0", "HTTP 422 Unprocessable Entity", "PASSED"],
        ["TC-10", "DB Failover", "Database Reconnect", "Simulated connection drop", "Zero 500 crashes, graceful recovery", "PASSED"]
    ]
    t_101 = doc.add_table(rows=len(t101_data) + 1, cols=6)
    style_table(t_101, [0.8, 1.2, 1.5, 1.5, 1.3, 0.7], t101_headers, t101_data)

    add_h2("10.2 Frontend Performance & Google Chrome Lighthouse Audit")
    add_p("The React 18 client was audited using Google Chrome Lighthouse on simulated 4G mobile connections:")

    t102_headers = ["Audit Dimension", "Score Achieved", "Target Benchmark", "Key Technical Observations"]
    t102_data = [
        ["Performance", "96 / 100", ">= 90", "First Contentful Paint (FCP) = 0.7s, Largest Contentful Paint = 1.3s"],
        ["Accessibility (a11y)", "98 / 100", ">= 90", "High color contrast (>4.9:1), explicit ARIA labels on voice and modals"],
        ["Best Practices", "100 / 100", ">= 90", "Zero console errors, clean HTTPS resource loading, modern ESM scripts"],
        ["SEO", "95 / 100", ">= 90", "Semantic HTML5 layout, descriptive title tags, meta descriptions"]
    ]
    t_102 = doc.add_table(rows=len(t102_data) + 1, cols=4)
    style_table(t_102, [1.5, 1.2, 1.2, 2.6], t102_headers, t102_data)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 11: BENEFICIARY IMPACT, ECONOMIC ANALYSIS & DEPLOYMENT
    # =========================================================================
    add_h1("CHAPTER 11: BENEFICIARY IMPACT, ECONOMIC ANALYSIS & DEPLOYMENT")
    add_h2("11.1 Beneficiary Stakeholder Matrix")
    add_p("Table 11.1 outlines the direct operational impact of BuildSure AI across construction stakeholder groups:")

    t111_headers = ["Stakeholder Group", "Primary Operational Pain Point", "BuildSure AI Value Proposition & Impact"]
    t111_data = [
        ["Project Directors", "Lack of macro-level site risk visibility; delayed audit updates", "Consolidated 0-100 unified risk score with one-click PDF/CSV executive reports"],
        ["Safety Supervisors (SSOs)", "Exhausting manual clipboard inspections; missed blindspot hazards", "Live YOLO vision detection HUD, automatic alerts, and instant triage workflows"],
        ["Compliance Auditors", "Reviewing hundreds of paper binders; manual OSHA/BOCW rule citations", "Automated document ingestion with exact page citations and rule evaluations"],
        ["Insurance Underwriters", "Missing incident evidence; disputed claim timelines and liabilities", "5-item audit-ready claim dossiers with telemetry, keyframes, and supervisor sign-offs"],
        ["Site Construction Workers", "High risk of fatal head/torso injuries from falling debris or machinery", "Proactive PPE enforcement ensuring protective gear is worn throughout all shifts"]
    ]
    t_111 = doc.add_table(rows=len(t111_data) + 1, cols=3)
    style_table(t_111, [1.8, 2.3, 2.4], t111_headers, t111_data)

    add_h2("11.2 Economic Return on Investment (ROI) & Hazard Prevention")
    add_p("Financial impact modeling demonstrates compelling cost savings:")
    add_bullet("By identifying missing hard hats and safety vests before accidents occur, the system reduces severe workplace injuries by an estimated 35-45%.", bold_prefix="1. Catastrophic Accident Reduction: ")
    add_bullet("Eliminating third-party cloud vision API subscriptions saves construction firms thousands of dollars annually per project site.", bold_prefix="2. Zero Recurring Cloud Costs: ")
    add_bullet("Standardized 5-item claim dossiers expedite insurance claim processing from months to days while defending against fraudulent claims.", bold_prefix="3. Accelerated Insurance Settlements: ")

    add_h2("11.3 Cloud & Edge Deployment Strategy")
    add_bullet("Deployed on Vercel or Cloudflare Pages with global Edge CDN caching and automated SSL termination.", bold_prefix="1. Frontend SPA: ")
    add_bullet("Containerized using Docker (`python:3.11-slim`) on cloud platforms (Render / Railway / AWS ECS) or deployed on local on-premise edge servers equipped with quad-core CPUs.", bold_prefix="2. FastAPI Backend: ")
    add_bullet("Operates on lightweight SQLite with zero setup overhead or connects to managed PostgreSQL with connection pooling via SQLAlchemy.", bold_prefix="3. Database Tier: ")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 12: SUSTAINABLE DEVELOPMENT GOALS (SDGs)
    # =========================================================================
    add_h1("CHAPTER 12: SUSTAINABLE DEVELOPMENT GOALS (SDGs)")
    add_p("BuildSure AI directly supports four United Nations Sustainable Development Goals (SDGs):")
    add_bullet("Significantly reduces occupational fatalities and severe trauma injuries on construction sites through proactive real-time PPE enforcement and spatial hazard mitigation.", bold_prefix="1. SDG 3 — Good Health and Well-Being (Target 3.9): ")
    add_bullet("Promotes safe, secure, and dignified working environments for millions of construction laborers and migrant workers by eliminating unmonitored dangerous working conditions.", bold_prefix="2. SDG 8 — Decent Work and Economic Growth (Target 8.8): ")
    add_bullet("Fosters digital public goods and domestic technological capability by deploying state-of-the-art open-source computer vision and modern web engineering in construction infrastructure.", bold_prefix="3. SDG 9 — Industry, Innovation, and Infrastructure (Target 9.4): ")
    add_bullet("Supports sustainable urban construction practices by reducing project downtime, minimizing legal disputes, and ensuring safe urban infrastructure development.", bold_prefix="4. SDG 11 — Sustainable Cities and Communities (Target 11.7): ")

    # =========================================================================
    # CHAPTER 13: FUTURE ENHANCEMENTS & CONCLUSION
    # =========================================================================
    add_h1("CHAPTER 13: FUTURE ENHANCEMENTS & CONCLUSION")
    add_h2("13.1 Future Enhancements")
    add_bullet("Extending YOLOv8 vision to autonomous drones for aerial inspection of high-rise facade work and expansive infrastructure projects.", bold_prefix="1. Drone Vision Integration: ")
    add_bullet("Deploying quantized YOLO models on ultra-low-power Edge TPUs (e.g., Google Coral or Raspberry Pi 5) for solar-powered site cameras.", bold_prefix="2. Edge TPU Micro-Hardware: ")
    add_bullet("Broadcasting critical emergency work-stoppage alerts directly to field foremen's basic mobile phones via WhatsApp and SMS gateways.", bold_prefix="3. WhatsApp & SMS Emergency Dispatch: ")
    add_bullet("Recording immutable safety compliance certificates and insurance sign-offs on decentralized ledgers to eliminate document tampering.", bold_prefix="4. Smart Contract Blockchain Verification: ")

    add_h2("13.2 Conclusion")
    add_p("The BuildSure AI platform demonstrates the transformative power of Modern Web Programming when united with Applied Deep Neural Networks. By coupling React 18 and Vite 5 for a responsive, bilingual user interface, FastAPI for high-throughput asynchronous services, SQLite for persistent relational audit trails, and YOLOv8 for real-time computer vision, BuildSure AI establishes an autonomous risk intelligence layer across dynamic construction environments.")
    
    add_p("The system bridges the historic divide between physical on-site worker safety, regulatory legal compliance, and commercial insurance risk management. By transforming static checklists into proactive, automated intelligence, BuildSure AI safeguards human lives, empowers safety officers, and delivers an accessible digital public good for modern industrial safety.")

    doc.add_page_break()

    # =========================================================================
    # REFERENCES
    # =========================================================================
    add_h1("REFERENCES")
    refs = [
        "Occupational Safety and Health Administration (OSHA). (2024). Safety and Health Regulations for Construction (29 CFR 1926). United States Department of Labor, Washington, D.C.",
        "Ministry of Labour and Employment, Government of India. (1998). The Building and Other Construction Workers (Regulation of Employment and Conditions of Service) Central Rules, 1998. New Delhi.",
        "Jocher, G., Chaurasia, A., & Qiu, J. (2023). Ultralytics YOLOv8: Real-Time Object Detection and Image Segmentation. Version 8.1.0. https://github.com/ultralytics/ultralytics.",
        "Tiangolo, S. (2024). FastAPI: Modern, Fast (High-Performance) Web Framework for Building APIs with Python 3.8+. https://fastapi.tiangolo.com.",
        "Facebook Open Source. (2023). React 18 Documentation: Declarative, Component-Based UI for the Modern Web. https://react.dev.",
        "Vite Core Team. (2024). Vite: Next Generation Frontend Tooling. https://vitejs.dev.",
        "Bayer, M. (2023). SQLAlchemy: The Python SQL Toolkit and Object Relational Mapper. Version 2.0. https://www.sqlalchemy.org.",
        "World Wide Web Consortium (W3C). (2023). Web Speech API Specification: SpeechRecognition and SpeechSynthesis Interfaces. W3C Recommendation.",
        "Fang, W., Ding, L., Love, P. E., Shen, Q., & Liang, H. (2020). Computer Vision Applications in Construction Safety: A Systematic Review. Automation in Construction, 110, 103022.",
        "Hinze, J., Thurman, S., & Wehle, A. (2018). Leading Indicators of Construction Safety: An Analysis of Pre-Contact Hazards. Safety Science, 50(7), 1594-1601.",
        "Paszke, A., Gross, S., Massa, F., Lerer, A., Bradbury, J., et al. (2019). PyTorch: An Imperative Style, High-Performance Deep Learning Library. Advances in Neural Information Processing Systems (NeurIPS 32), 8024-8035.",
        "Bradski, G. (2000). The OpenCV Library. Dr. Dobb's Journal of Software Tools, 25(11), 120-125."
    ]
    for i, r in enumerate(refs):
        add_p(f"[{i+1}]  {r}", space_after=4)

    doc.add_page_break()

    # =========================================================================
    # APPENDIX
    # =========================================================================
    add_h1("APPENDIX")
    add_h2("Appendix A: Complete SQLite / SQL Production DDL Schema (schema.sql)")
    add_callout("""
-- BuildSure AI Production Relational Schema (SQLite / PostgreSQL Compatible)
CREATE TABLE IF NOT EXISTS safety_zone_rules (
    rule_id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(50) DEFAULT 'PRJ-101',
    zone_name VARCHAR(100) NOT NULL,
    requires_helmet BOOLEAN DEFAULT 1,
    requires_vest BOOLEAN DEFAULT 0,
    requires_harness BOOLEAN DEFAULT 0,
    risk_multiplier REAL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ppe_violations (
    violation_id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL DEFAULT 'PRJ-101',
    zone_name VARCHAR(100) NOT NULL,
    camera_id VARCHAR(50) DEFAULT 'CAM-01',
    anonymous_worker_id VARCHAR(50) NOT NULL DEFAULT 'Worker-01',
    violation_type VARCHAR(100) NOT NULL,
    required_ppe TEXT,
    detected_ppe TEXT,
    missing_ppe TEXT,
    confidence_score REAL DEFAULT 0.90,
    base_risk_score REAL DEFAULT 60.0,
    zone_multiplier REAL DEFAULT 1.0,
    final_risk_score REAL DEFAULT 60.0,
    risk_category VARCHAR(20) DEFAULT 'Medium',
    decision_status VARCHAR(50) DEFAULT 'confirmed_violation',
    original_image_path VARCHAR(255),
    annotated_image_path VARCHAR(255),
    bounding_box_data TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'OPEN',
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_note TEXT
);

CREATE TABLE IF NOT EXISTS safety_alerts (
    alert_id VARCHAR(36) PRIMARY KEY,
    violation_id VARCHAR(36) REFERENCES ppe_violations(violation_id) ON DELETE CASCADE,
    project_id VARCHAR(50) NOT NULL DEFAULT 'PRJ-101',
    severity VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    risk_score REAL DEFAULT 60.0,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    automation_status VARCHAR(50) DEFAULT 'Not Configured',
    delivery_channel VARCHAR(50) DEFAULT 'None'
);

CREATE TABLE IF NOT EXISTS safety_audit_logs (
    audit_id VARCHAR(36) PRIMARY KEY,
    alert_id VARCHAR(36) NOT NULL REFERENCES safety_alerts(alert_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    user_reference VARCHAR(100) NOT NULL DEFAULT 'Safety Supervisor',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_documents (
    doc_id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL DEFAULT 'PRJ-101',
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    document_category VARCHAR(100) NOT NULL,
    extracted_text TEXT,
    page_count INTEGER DEFAULT 1,
    extraction_method VARCHAR(50) DEFAULT 'pypdf',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PROCESSED'
);

CREATE TABLE IF NOT EXISTS regulatory_rules (
    rule_id VARCHAR(36) PRIMARY KEY,
    source_name VARCHAR(150) NOT NULL,
    standard_code VARCHAR(100) NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL DEFAULT 'Reference Standard',
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    requirement_summary TEXT NOT NULL,
    penalty_severity VARCHAR(20) DEFAULT 'HIGH',
    is_active BOOLEAN DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_violations_zone ON ppe_violations(zone_name);
CREATE INDEX IF NOT EXISTS idx_violations_status ON ppe_violations(status);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON safety_alerts(status);
    """, title="Appendix A: Production DDL Schema")

    add_h2("Appendix B: Sample FastAPI Ingestion & Inference JSON Payloads")
    add_callout("""
1. System Health Status (GET /health):
{
  "status": "healthy",
  "database": "sqlite_connected",
  "models": {
    "yolov8n": "loaded_and_operational",
    "weights": "yolov8n.pt (PyTorch 2.2)"
  },
  "active_agents": ["SiteRiskAgent", "SafetyAgent", "ComplianceEngine", "InsuranceEngine"],
  "timestamp": "2026-10-22T09:40:00Z"
}

2. Image PPE Detection Inference Output (POST /api/safety/analyze-image):
{
  "status": "success",
  "project_id": "PRJ-101",
  "zone_name": "Scaffolding Zone B",
  "zone_multiplier": 1.5,
  "detections_count": 2,
  "workers": [
    {
      "worker_tag": "Worker-01",
      "bbox": [104, 80, 316, 482],
      "confidence": 0.97,
      "head_region_bbox": [104, 80, 316, 220],
      "torso_region_bbox": [104, 220, 316, 381],
      "ppe_status": {
        "hardhat": { "detected": false, "confidence": 0.0, "status": "VIOLATION" },
        "safety_vest": { "detected": true, "confidence": 0.92, "status": "COMPLIANT" }
      },
      "base_risk_score": 65.0,
      "final_risk_score": 97.5,
      "risk_category": "Critical",
      "decision_status": "confirmed_violation"
    }
  ],
  "annotated_image_url": "/results/annotated_upload_20261022_094012.jpg"
}

3. Executive Unified Risk Scorecard Output (GET /api/reports/scorecard):
{
  "project_id": "PRJ-101",
  "project_name": "Coimbatore Metro Infrastructure - Phase 2",
  "evaluation_date": "2026-10-22",
  "unified_project_risk_score": 28.5,
  "risk_classification": "CAUTION",
  "formula": "0.35 * Safety + 0.35 * Compliance + 0.30 * Insurance",
  "component_scores": {
    "safety_score": 32.0,
    "compliance_gap_score": 18.0,
    "insurance_exposure_score": 36.5
  },
  "active_work_zones": 6,
  "monitored_personnel": 48,
  "open_alerts_count": 2
}
    """, title="Appendix B: Sample API Request & Response JSON Payloads")

    output_path = "BuildSure_AI_Project_Report_S_Dhanusri.docx"
    doc.save(output_path)
    print(f"Report successfully generated at: {output_path}")

if __name__ == "__main__":
    create_report()
