$(()=>{
const app = Sammy('#container',function () {
    this.use('Handlebars','hbs')

    this.get('#/home', getWelcomePage);
    this.get('index.html', getWelcomePage);

    //register
    this.post('#/register', (ctx) => {
        let username = ctx.params['username-register']
        let password = ctx.params['password-register']
        let repeatPass = ctx.params['password-register-check']

        if (!/^[A-Za-z0-9_]{5,}$/.test(username)) {
            notify.showError('Username should be at least 5 characters long!');
        } else if (!password) {
            notify.showError('Password cannot be empty!');
        } else if (repeatPass !== password) {
            notify.showError('Passwords must match!');
        } else {
            auth.register(username, password)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('User registration successful.');
                    ctx.redirect('#/receipt');
                })
                .catch(notify.handleError);
        }
    })

    //login
    this.post('#/login', (ctx) => {
        let username = ctx.params['username-register']
        let password = ctx.params['password-register']

        if (username === '' || password === '') {
            notify.showError('All fields should be non-empty!');
        } else if (!/^[A-Za-z0-9_]{5,}$/.test(username)) {
            notify.showError('Username should be at least 5 characters long!');
        } else if (!password) {
            notify.showError('Password cannot be empty!');
        } else if (repeatPass !== password) {
            notify.showError('Passwords must match!');
        } else {
            auth.login(username, password)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('Login successful.');
                    ctx.redirect('#/receipt');
                })
                .catch(notify.handleError);
        }
    })

    //logout
    this.get('#/logout', (ctx) => {
        auth.logout()
            .then(() => {
                sessionStorage.clear()
                notify.showInfo('Logout successful.')
                ctx.redirect('#/home');
            })
            .catch(notify.handleError);
    })

    //homePage when authenticated
    this.get('#/receipts', (ctx) => {
        if (!auth.isAuth()) {
            ctx.redirect('#/home');
            return;
        }
        let userId = sessionStorage.getItem('userId')
        receipts.getMyReceipts(userId).then((receipts)=>{
            ctx.isAuth = auth.isAuth()
            ctx.username = sessionStorage.getItem('username')

            ctx.receipts = receipts
            let totalAll=0
            receipts.forEach((rec)=>{
                totalAll+=Number(rec.total)
            })
            ctx.totalAll = totalAll
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                navigation: './templates/common/navigation.hbs',
                receiptsList: './templates/receipts/receiptsList.hbs',
                totalAllReceipts: './templates/receipts/totalAllReceipts.hbs'
            }).then(function () {
                this.partial('./templates/receipts/allReceipts.hbs')
            })
        }).catch(notify.handleError)
    })

    //Receipt checkout
    this.post('#/receipt/create',(ctx)=>{
        let receiptId = sessionStorage.getItem('receiptId')
        let author=sessionStorage.getItem('username')
        entries.getReceiptEntries(receiptId).then((entry)=>{
            let productCount = entry.length
            if (productCount<1){
                notify.showError('You must enter at least 1 product!')
                return
            }
            let total=0
            entry.forEach((en)=>{
                total+=Number(en.qty)*Number(en.price)
            })
            let date = Date.now()
            console.log(date)
            receipts.updateReceipt( receiptId,false,productCount,total,date).then(()=>{
                notify.showInfo('Receipt checked out')
                sessionStorage.removeItem('receiptId')
                ctx.redirect('#/home')
            })

        }).catch(notify.handleError)
    })
    //edit receipt
    this.get('#/receipt',(ctx)=> {
        let userId = sessionStorage.getItem('userId')
        receipts.getActiveReceipts(userId).then((receipt)=>{
            if(receipt.length===0){
               receipts.createReceipt(userId,true,0,0).then((receipt)=>{

                   sessionStorage.setItem('receiptId', receipt._id)
                  // console.log(sessionStorage.getItem('receiptId'));
                   entries.getReceiptEntries(receipt._id).then((entry) => {
                       //console.log(entry);
                       let totalReceipt = 0
                       entry.forEach((e) => {
                           e.sub = Number(e.qty) * Number(e.price)
                           totalReceipt += Number(e.sub)
                       })
                       ctx.isAuth = auth.isAuth()
                       ctx.entry = entry
                       ctx.username = sessionStorage.getItem('username')
                       ctx.receiptId = receipt._id
                       ctx.total = totalReceipt

                       ctx.loadPartials({
                           header: './templates/common/header.hbs',
                           footer: './templates/common/footer.hbs',
                           navigation: './templates/common/navigation.hbs',
                           createEntryForm: './templates/forms/createEntryForm.hbs',
                           createReceiptForm: './templates/forms/createReceiptForm.hbs',
                           entries: './templates/entries/entries.hbs'
                       }).then(function () {
                           this.partial('./templates/receipts/createReceiptPage.hbs')
                       })
               }) })
            }else{

                entries.getReceiptEntries(receipt[0]._id).then((entry) => {
                    sessionStorage.setItem('receiptId', receipt[0]._id)

                    //console.log(entry);
                    let totalReceipt = 0
                    entry.forEach((e) => {
                        e.sub = Number(e.qty) * Number(e.price)
                        totalReceipt += Number(e.sub)
                    })
                    ctx.isAuth = auth.isAuth()
                    ctx.entry = entry
                    ctx.username = sessionStorage.getItem('username')
                    ctx.receiptId = receipt._id
                    ctx.total = totalReceipt

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                        createEntryForm: './templates/forms/createEntryForm.hbs',
                        createReceiptForm: './templates/forms/createReceiptForm.hbs',
                        entries: './templates/entries/entries.hbs'
                    }).then(function () {
                        this.partial('./templates/receipts/createReceiptPage.hbs')
                    })
                }).catch(notify.handleError)
            }

        })



        })


    this.post('#/entry/create/',(ctx)=>{

        let receiptId = sessionStorage.getItem('receiptId')
        let type = ctx.params.type
        let qty = ctx.params.qty
        let price = ctx.params.price
        //let subtotal = ctx.params.subtotal

        if(type===''){
            notify.showError('Product Name cannot be empty')
        }else if(isNaN(Number(qty))){
            notify.showError('Quantity must be a number!')
        }else if(isNaN(Number(price))){
            notify.showError('Price must be a number!')
        }else {
        entries.createEntry(receiptId,type,qty,price).then(()=>{
            notify.showInfo('Entry added')
            ctx.redirect('#/receipt')
        })
        }

    })
    this.get('#/entry/delete/:entryId',(ctx)=>{
        let entryId = ctx.params.entryId
        entries.deleteEntry(entryId).then(()=>{
            notify.showInfo('Entry removed')
            ctx.redirect('#/receipt')
        }).catch(notify.handleError)
    })

    //Receipt Overview
    this.get('#/receipt/detail/:receiptId',(ctx)=>{
        let receiptId = ctx.params.receiptId
        entries.getReceiptEntries(receiptId).then((entry)=>{
            entry.forEach((en)=>{
                en.sub = Number(en.price)*Number(en.qty)
            })
            ctx.isAuth = auth.isAuth()
            ctx.username = sessionStorage.getItem('username')
            ctx.products = entry
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                navigation:'./templates/common/navigation.hbs'
            }).then(function () {
                this.partial('./templates/receipts/receiptDetails.hbs')
            })
        }).catch(notify.handleError)

    })

    function getWelcomePage(ctx) {
        if (!auth.isAuth()) {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/forms/loginForm.hbs',
                registerForm: './templates/forms/registerForm.hbs',
                navigation:'./templates/common/navigation.hbs'
            }).then(function () {
                this.partial('./templates/welcome-anonymous.hbs');
            })
        } else {
            ctx.redirect('#/receipt');
        }
    }

    })
    app.run()
})