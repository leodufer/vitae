const statusController = {
    getStatus(req, res) {
        res.json({ status: 'online' });
    }
};

module.exports = statusController;
