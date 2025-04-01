const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const iconv = require('iconv-lite');

const config = require('./config.json');

const fonte = './fonts/ARIAL.TTF';
const fonteBold = './fonts/ARIALBD.TTF';

const diretorio = config.diretorio;
const saidaPDF = config.saidaPDF;
const titulo = config.titulo;

function loadIgnoreList(ignoreFile) {
    if (!fs.existsSync(ignoreFile)) return [];
    return fs.readFileSync(ignoreFile, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#')); // Remove linhas vazias e comentários
}

function shouldIgnore(filePath, ignoreList) {
    return ignoreList.some(ignore => {
        // Verifica se é um diretório ou arquivo específico
        return filePath.includes(ignore) || filePath.endsWith(ignore);
    });
}

function getAllFiles(dir, fileTypes, ignoreList) {
    // let results = [];

    // const list = fs.readdirSync(dir);
    // list.forEach(file => {
    //     const filePath = path.join(dir, file);
    //     const stat = fs.statSync(filePath);
        
    //     if (shouldIgnore(filePath, ignoreList)) return; // Ignora o arquivo
        
    //     if (stat.isDirectory()) {
    //         results = results.concat(getAllFiles(filePath, fileTypes, ignoreList));
    //         queue.push(filePath);
    //     } else if (fileTypes.includes(path.extname(file))) {
    //         results.push(filePath);
    //     }
    // });

    let results = [];
    const list = fs.readdirSync(dir);

    // Separar diretórios e arquivos
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

    // Ordenar alfabeticamente, garantindo que pastas vêm antes dos arquivos
    directories.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
    files.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));

    // Primeiro, processar diretórios
    directories.forEach(subDir => {
        results = results.concat(getAllFiles(subDir, fileTypes, ignoreList));
    });

    // Depois, adicionar arquivos
    results = results.concat(files);
    
    return results;
}

function createPDF(outputPath, dir, fileTypes = ['', '.jsx', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.css', '.json', '.html']) {
    const doc = new PDFDocument({
        size: 'A4', margin: 50
    });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const ignoreList = loadIgnoreList('.ignore');
    const files = getAllFiles(dir, fileTypes, ignoreList);

    if (files.length === 0) {
        doc.text('Nenhum arquivo encontrado.', { align: 'center' });
    } else {
        files.forEach((filePath, index) => {
            if (index != 0)
                doc.addPage()
            else {
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
        
            if (index == files.length - 1) {
                const pageHeight = doc.page.height;

                const hoje = new Date();
                const dia = String(hoje.getDate()).padStart(2, '0'); // Adiciona 0 à esquerda, se necessário
                const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Meses começam em 0, por isso somamos 1
                const ano = hoje.getFullYear();

                doc.font(fonte).fontSize(13).text(`Dourados MS, ${dia}/${mes}/${ano} ---`, 50, pageHeight - 100);
            }
        });
    }

    doc.end();
    console.log(`PDF gerado com sucesso: ${outputPath}`);
}

createPDF(saidaPDF, diretorio);