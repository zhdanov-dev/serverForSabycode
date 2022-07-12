const fs = require('fs');
const path = require('path');
const {Session} = require('../models/models');

class sessionController {

    // после изменения файла загружаем его на сервер    

    async updateFile(req, res) {
        try {
            const data = req.body.input;
            const fileName = req.query.id.toString();
            fs.writeFileSync(path.resolve(__dirname, '..', 'files', fileName + '.txt'), data);
            const session = await Session.create({sessionStatic: fileName});
            return res.status(200).json(session.id);
        } catch(e) {
            console.log(e);
            return res.status(500).json('erqwqe');
        }
    }

    // отдаем файл при первом подключении

    async getFile(req, res) {
        try {
            const fileName = req.query.id.toString();
            const file = fs.readFileSync(path.resolve(__dirname, '..', 'files', fileName + '.txt')).toString();
            return res.json(file);
        } catch(e) {
            console.log(e);
            return res.status(500).json('er');
        }
    }
}

module.exports = new sessionController();