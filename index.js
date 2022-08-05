const csvToJson = require("csvtojson");
const fs = require("fs");
const axios = require("axios").default;
const FormData = require("form-data");

const args = process.argv.splice(2);

if (args.length < 1) {
    console.log("No filepath given. Use it as a first parameter.");
    process.exit(1);
}

const filePath = args[0];
const delimiter = args[1];
const topLevelFile = args[2];
let writeStream;

csvToJson({ delimiter: delimiter })
    .fromFile(filePath)
    .then(jsonObj => {
        let domainBases = [];
        let domains = [];
        let tlds = getTlds(topLevelFile);

        jsonObj.forEach(obj => {
            let arr = [];
            Object.keys(obj).forEach(key => arr.push(obj[key]));
            let perms = permute(arr);

            perms = perms.map(perm => perm.join(""));

            domainBases.push(perms);
        });

        domainBases = domainBases.flat();

        domainBases.forEach(base => {
            tlds.forEach(tld => {
                domains.push(`${base}.${tld}`);
            });
        });

        initTable();
        checkDomains(domains);
    });

async function checkDomains(domains) {
    length = domains.length;
    for(let i = 0; i < length; i++) {
        console.log(`Progress: ${i+1}/${length} | Currently checking: ${domains[i]}`);
        let result = await doRequest(domains[i]);

        writeStream.write(`\n| ${result.domain} | ${result.active === '0' ? "No" : "Yes"} |`);
    }

    writeStream.close();
}

function getTlds(path) {
    let content = fs.readFileSync(path).toString();

    let tlds = content.split(",");
    tlds = tlds.map(tld => tld.trim());

    return tlds;
}

function permute(permutation) {
    var length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0),
        i = 1, k, p;

    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            result.push(permutation.slice());
        } else {
            c[i] = 0;
            ++i;
        }
    }
    return result;
}

function doRequest(domain) {
    return new Promise((resolve, reject) => {
        let bodyForm = new FormData();
        bodyForm.append("pendingSiteAnalysis", "9b80555e77cf9c6495a092f6bb35db65e5d3a0416114510b70b746b538ceaa0a");
        axios({
            method: "post",
            url: `https://who.is/api/whois/getDomainSiteAnalysis/` + domain,
            data: bodyForm,
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then(resp => {
            resolve({domain: domain, active: resp.data.active});
        });
    });

}

function initTable() {
    writeStream = fs.createWriteStream("table.md");
    writeStream.write("| Domain | Taken |");
    writeStream.write("\n| ------ | ----- |");
}