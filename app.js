const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const fonte = './fonts/ARIAL.TTF';
const fonteBold = './fonts/ARIALBD.TTF';

const config = require('./config.json');

function loadIgnoreList(ignoreFile) {
    if (!fs.existsSync(ignoreFile)) return [];
    return fs.readFileSync(ignoreFile, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
}

function shouldIgnore(filePath, ignoreList) {
    return ignoreList.some(ignore => {
        return filePath.includes(ignore) || filePath.endsWith(ignore);
    });
}

function getAllFiles(dir, fileTypes, ignoreList) {
    let results = [];
    const list = fs.readdirSync(dir);

    let directories = [];
    let files = [];

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (shouldIgnore(filePath, ignoreList)) return;

        if (stat.isDirectory()) {
            directories.push(filePath);
        } else if (fileTypes.includes(path.extname(file))) {
            files.push(filePath);
        }
    });

    directories.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
    files.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));

    directories.forEach(subDir => {
        results = results.concat(getAllFiles(subDir, fileTypes, ignoreList));
    });

    results = results.concat(files);

    return results;
}

function createPDF(outputPath, dir, ignoreFile, titulo, fileTypes = ['', '.jsx', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.css', '.json', '.html']) {
    const doc = new PDFDocument({
        size: 'A4', margin: 50
    });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const ignoreList = loadIgnoreList(ignoreFile);
    const files = getAllFiles(dir, fileTypes, ignoreList);

    if (files.length === 0) {
        doc.text('Nenhum arquivo encontrado.', { align: 'center' });
    } else {
        files.forEach((filePath, index) => {
            if (index !== 0) {
                doc.addPage();
            } else {
                doc.font(fonteBold).fontSize(14).text(titulo, { align: 'center' }).moveDown();
            }

            const relativePath = path.relative(dir, filePath);
            doc.font(fonteBold).fontSize(13).text(`diretório.arquivo: ${path.parse(relativePath.split(path.sep).join('.')).name}`, { lineBreak: true });
            doc.fontSize(13).text(' ', { lineBreak: true });

            const content = fs.readFileSync(filePath, 'utf-8')
                .replace(/    /g, 'tabtab')
                .split('\n')
                .map(line => line.trim())
                .join('\n')
                .replace(/tabtab/g, '    ');

            doc.font(fonte).fontSize(13).text(content, { width: 500, lineBreak: true, preserveLeadingSpaces: true });

            if (index === files.length - 1) {
                const pageHeight = doc.page.height;
                const hoje = new Date();
                const dia = String(hoje.getDate()).padStart(2, '0');
                const mes = String(hoje.getMonth() + 1).padStart(2, '0');
                const ano = hoje.getFullYear();
                doc.font(fonte).fontSize(13).text(`Dourados MS, ${dia}/${mes}/${ano} ---`, 50, pageHeight - 100);
            }
        });
    }

    doc.end();
    console.log(`PDF gerado com sucesso: ${outputPath}`);
}

// Geração para front-end
createPDF(
    path.join(config.dirSaida, './front-end.pdf'),
    path.join(config.diretorio, '/front-end'),
    '.ignore-front',
    config.titulo
);

// Geração para back-end
createPDF(
    path.join(config.dirSaida, './back-end.pdf'),
    path.join(config.diretorio, '/back-end'),
    '.ignore-back',
    config.titulo
);
