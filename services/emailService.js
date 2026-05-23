const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
    if(transporter == null) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE == "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    return transporter;
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function buildOrderHtml(order) {
    const rows = order.itens.map((item) => {
        const subtotal = Number(item.valor || 0) * Number(item.quantidade || 0);
        return `
            <tr>
                <td>${item.nome}</td>
                <td align="center">${item.quantidade}</td>
                <td align="right">${formatCurrency(item.valor)}</td>
                <td align="right">${formatCurrency(subtotal)}</td>
            </tr>`;
    }).join("");

    return `
        <h2>Pedido #${order.pedidoId}</h2>
        <p>Recebemos o seu pedido. Seguem os detalhes:</p>
        <table width="100%" cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
            <thead>
                <tr>
                    <th align="left">Produto</th>
                    <th>Quantidade</th>
                    <th align="right">Valor unitario</th>
                    <th align="right">Subtotal</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <h3>Total: ${formatCurrency(order.total)}</h3>`;
}

async function sendOrderEmail(order) {
    await getTransporter().sendMail({
        from: process.env.SMTP_FROM,
        to: order.email,
        subject: `Pedido #${order.pedidoId} confirmado`,
        html: buildOrderHtml(order)
    });
}

module.exports = {
    sendOrderEmail
};
