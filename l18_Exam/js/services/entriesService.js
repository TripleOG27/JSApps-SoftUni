let entries = (()=>{
    function getReceiptEntries(receiptId) {
        const endpoint = `entries?query={"receiptId":"${receiptId}"}&sort={"_kmd.ect": 1}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }

    function createEntry(receiptId, type,qty, price) {
        const endpoint = 'entries';
        let data = { receiptId, type,qty, price };

        return remote.post('appdata', endpoint, 'kinvey', data);
    }

    function deleteEntry(entryId) {
        const endpoint = `entries/${entryId}`;

        return remote.remove('appdata', endpoint, 'kinvey');
    }



    return {
        getReceiptEntries,
        createEntry,
        deleteEntry
    }
})()