
import { QuizData, TestPaper } from "../types";

export const pdfService = {
  // --- QUIZ PDFS ---
  generateQuizPDF(quiz: QuizData) {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text(quiz.title, 10, 20);
    doc.setFontSize(10);
    doc.text(`EduMind AI Question Paper - ${new Date().toLocaleDateString()}`, 10, 28);
    
    let y = 40;
    quiz.questions.forEach((q, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      const lines = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, 180);
      doc.text(lines, 10, y);
      y += lines.length * 7;
      
      doc.setFont(undefined, 'normal');
      q.options.forEach((opt, oi) => {
        doc.text(`${String.fromCharCode(65 + oi)}) ${opt}`, 15, y);
        y += 6;
      });
      y += 6;
    });

    doc.save(`${quiz.title.replace(/\s+/g, '_')}_Questions.pdf`);
  },

  generateQuizAnswerKeyPDF(quiz: QuizData) {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text(`${quiz.title} - Answer Key`, 10, 20);
    
    let y = 35;
    quiz.questions.forEach((q, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Q${i + 1} Correct Answer: ${q.correctAnswer}`, 10, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(`Explanation: ${q.explanation}`, 180);
      doc.text(lines, 10, y);
      y += lines.length * 5 + 8;
    });

    doc.save(`${quiz.title.replace(/\s+/g, '_')}_AnswerKey.pdf`);
  },

  // --- TEST PDFS ---
  generateTestPDF(test: TestPaper) {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(test.title, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Duration: ${test.duration}`, 10, 30);
    doc.text(`Max Marks: ${test.totalMarks}`, 170, 30);
    doc.line(10, 35, 200, 35);

    let y = 45;
    test.sections.forEach(section => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(section.sectionTitle, 10, y);
      y += 10;
      
      section.questions.forEach(q => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(`${q.id}. ${q.text}`, 160);
        doc.text(lines, 10, y);
        doc.text(`[${q.marks}]`, 185, y);
        y += lines.length * 7;

        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, oi) => {
            doc.text(`${String.fromCharCode(65 + oi)}) ${opt}`, 15, y);
            y += 6;
          });
        }
        y += 5;
      });
      y += 5;
    });

    doc.save(`${test.title.replace(/\s+/g, '_')}_Test_Questions.pdf`);
  },

  generateTestAnswerKeyPDF(test: TestPaper) {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`${test.title} - Marking Scheme`, 105, 20, { align: 'center' });
    doc.line(10, 25, 200, 25);

    let y = 35;
    test.sections.forEach(section => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(section.sectionTitle, 10, y);
      y += 8;

      section.questions.forEach(q => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`Q${q.id} Answer:`, 10, y);
        y += 5;
        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(q.answer, 180);
        doc.text(lines, 10, y);
        y += lines.length * 5 + 8;
      });
    });

    doc.save(`${test.title.replace(/\s+/g, '_')}_MarkingScheme.pdf`);
  }
};
