const {Session} = require('../models/models');

class sessionController {

    // после изменения файла загружаем его на сервер    

    async createSession(req, res) {
        try {
            const fileName = req.query.id;
            const candidate = await Session.findOne({where: {sessionStatic: fileName}});
            if (candidate) return res.status(200).json({message: "Сессия уже существует!", sessionId: candidate.id});
            else {
                const session = await Session.create({sessionStatic: fileName});
                return res.status(200).json({message: "Сессия создана!", sessionId: session.id});
            }
        } catch(e) {
            console.log(e);
            return res.status(500).json('erqwqe');
        }
    }
}

module.exports = new sessionController();