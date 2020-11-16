const jsonDiffPatch = require('deep-diff')
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const sortKeys = require('sort-keys');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const myArgs = process.argv.slice(2);
if (myArgs < 2) {
    console.error("files are missing")
    console.log("usage: npm run diff -- <file1.ext> <file2.ext>")
    exit(1)
}
const qa = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", path.basename(myArgs[0])), 'utf8'))
const prod = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", path.basename(myArgs[1])), 'utf8'))

const sortedQA = sortKeys(qa, { deep: true })
const sortedProd = sortKeys(prod, { deep: true })

const diff = jsonDiffPatch.diff(sortedQA, sortedProd)



let csvWriter = createCsvWriter({
    path: path.resolve(__dirname, "..", "all-diff.csv"),
    header: [
        { id: 'kind', title: 'Type Of Edit' },
        { id: 'path', title: 'Object Path' },
        { id: 'lhs', title: 'Left' },
        { id: 'rhs', title: 'Right' }
    ]
});

csvWriter.writeRecords(diff)

//changed links 
//changed links 
//changed links 
csvWriter = createCsvWriter({
    path: path.resolve(__dirname, "..", "changeddiff.csv"),
    header: [
        { id: 'path', title: 'Object Path' },
        { id: 'lhs', title: 'Left' },
        { id: 'rhs', title: 'Right' }
    ]
});

diffLinks(diff).then((linkChanges) => { csvWriter.writeRecords(linkChanges) })


async function diffLinks(diff) {
    let map1 = new Map();
    let linkChanges = [];
    for (i = 0; i < diff.length; i++) {
        let path = diff[i].path
        let left = new String(diff[i].lhs).replace('\\"').split("/")
        let right = new String(diff[i].rhs).replace('\\"').split("/")
        for (j = 0; j < 3 && j < left.length; j++) {
            let obj = {};
            lhs = new String(left[j]).toLowerCase().trim()
            rhs = new String(right[j]).toLowerCase().trim()
            if (lhs !== "" && lhs !== rhs) {

                if (!map1.has(lhs)) {
                    obj.lhs = lhs
                    obj.rhs = rhs
                    obj.path = path
                    linkChanges.push(obj)
                    map1.set(lhs, { value: true })
                }

            }
        }

    }
    return linkChanges
}