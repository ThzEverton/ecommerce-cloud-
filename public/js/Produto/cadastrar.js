document.addEventListener("DOMContentLoaded", function(){

    var btnGravar = document.getElementById("btnGravar");

    btnGravar.addEventListener("click", gravarProduto);

    var inputImagem = document.getElementById("inputImagem");

    inputImagem.addEventListener("change", exibirImagem);
})

function imagemValida(file) {
    if(file == null || file.name == null) {
        return false;
    }

    var nome = file.name.toLowerCase();
    return nome.endsWith(".jpg") || nome.endsWith(".jpeg") || nome.endsWith(".png");
}

function exibirImagem() {

    var inputValue = document.getElementById("inputImagem").files[0];

    if(imagemValida(inputValue)) {
        var imgInput = document.getElementById("imgInput");
        imgInput.src = URL.createObjectURL(inputValue);
        imgInput.style["display"] = "block";
    }
    else{
        alert("Formato invalido (Apenas .jpg, .jpeg e .png)");
    }

}

function gravarProduto() {

    var inputCodigo = document.getElementById("inputCodigo");
    var inputNome = document.getElementById("inputNome");
    var inputQtde = document.getElementById("inputQtde");
    var selMarca = document.getElementById("selMarca");
    var selCategoria = document.getElementById("selCategoria");

    var inputImagem = document.getElementById("inputImagem");

    var inputPreco = document.getElementById("inputPreco");

    if(inputCodigo.value != "" && inputNome.value != "" && inputQtde.value != "" && inputQtde.value != '0' && selMarca.value != '0' && selCategoria.value != '0' && inputImagem.files != null && inputImagem.files.length > 0 && inputPreco.value != "" && inputPreco.value > '0') {


        var inputValue = inputImagem.files[0];
        if(imagemValida(inputValue)) {

            var formData = new FormData();
            formData.append("codigo", inputCodigo.value);
            formData.append("nome", inputNome.value);
            formData.append("quantidade", inputQtde.value);
            formData.append("marca", selMarca.value);
            formData.append("categoria", selCategoria.value);
            formData.append("inputImagem", inputValue);
            formData.append("preco", inputPreco.value);

            fetch('/admin/produto/cadastro', {
                method: "POST",
                body: formData
            })
            .then(r => {
                return r.json();
            })
            .then(r=> {
                if(r.ok) {
                    alert("Produto cadastrado!");
                }
                else{
                    alert(r.msg || "Erro ao cadastrar produto");
                }
            })
            .catch(e => {
                console.log(e);
            })
        }
        else{
            alert("Formato de arquivo invalido!")
        }
    }
    else{
        alert("Preencha todos os campos corretamente!");
        return;
    }
}
