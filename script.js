// Aplicação Licella - Calculadora de Custos
class LicellaApp {
    constructor() {
        this.insumos = JSON.parse(localStorage.getItem('licella_insumos')) || [];
        this.historico = JSON.parse(localStorage.getItem('licella_historico')) || [];
        this.init();
    }

    // Função para formatar preços com vírgula
    formatarPreco(valor, casasDecimais = 2) {
        return valor.toFixed(casasDecimais).replace('.', ',');
    }

    // Função para formatar unidades no singular/plural
    formatarUnidade(quantidade, unidade) {
        const unidades = {
            'gramas': { singular: 'grama', plural: 'gramas' },
            'quilos': { singular: 'quilo', plural: 'quilos' },
            'unidades': { singular: 'unidade', plural: 'unidades' },
            'mililitros': { singular: 'mililitro', plural: 'mililitros' },
            'litros': { singular: 'litro', plural: 'litros' }
        };
        
        const unidadeObj = unidades[unidade];
        if (!unidadeObj) return unidade;
        
        return quantidade === 1 ? unidadeObj.singular : unidadeObj.plural;
    }

    // Função para converter unidades
    converterUnidade(quantidade, unidadeOrigem, unidadeDestino) {
        if (unidadeOrigem === unidadeDestino) return quantidade;
        
        // Tabela de conversão para gramas como base
        const conversoes = {
            'gramas': 1,
            'quilos': 1000,
            'mililitros': 1, // Assumindo densidade da água
            'litros': 1000,
            'unidades': 1 // Unidades não se convertem
        };
        
        // Se as unidades são do mesmo grupo (peso ou volume), converter
        const gruposPeso = ['gramas', 'quilos'];
        const gruposVolume = ['mililitros', 'litros'];
        
        const origemPeso = gruposPeso.includes(unidadeOrigem);
        const destinoPeso = gruposPeso.includes(unidadeDestino);
        const origemVolume = gruposVolume.includes(unidadeOrigem);
        const destinoVolume = gruposVolume.includes(unidadeDestino);
        
        if ((origemPeso && destinoPeso) || (origemVolume && destinoVolume)) {
            const valorBase = quantidade * conversoes[unidadeOrigem];
            return valorBase / conversoes[unidadeDestino];
        }
        
        // Se não podem ser convertidas, retorna a quantidade original
        return quantidade;
    }

    init() {
        this.setupEventListeners();
        this.renderInsumos();
        this.renderUsoInsumos();
        this.renderHistorico();
        this.showSection('insumos');
    }

    setupEventListeners() {
        // Navegação
        document.getElementById('nav-insumos').addEventListener('click', () => this.showSection('insumos'));
        document.getElementById('nav-producao').addEventListener('click', () => this.showSection('producao'));
        document.getElementById('nav-historico').addEventListener('click', () => this.showSection('historico'));

        // Formulários
        document.getElementById('form-insumo').addEventListener('submit', (e) => this.handleAdicionarInsumo(e));
        document.getElementById('form-producao').addEventListener('submit', (e) => this.handleCalcularProducao(e));

        // Limpar histórico
        document.getElementById('limpar-historico').addEventListener('click', () => this.limparHistorico());
    }

    // Função utilitária para converter vírgula em ponto
    parseCommaNumber(value) {
        if (!value || value.trim() === '') return 0;
        if (typeof value === 'string') {
            // Remove espaços e converte vírgula para ponto
            const cleaned = value.trim().replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        }
        return parseFloat(value) || 0;
    }

    showSection(section) {
        // Remover classe active de todas as seções e botões
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        // Adicionar classe active na seção e botão corretos
        document.getElementById(`section-${section}`).classList.add('active');
        document.getElementById(`nav-${section}`).classList.add('active');

        // Atualizar lista de uso de insumos quando entrar na seção de produção
        if (section === 'producao') {
            this.renderUsoInsumos();
        }
    }

    handleAdicionarInsumo(e) {
        e.preventDefault();

        const nome = document.getElementById('nome-insumo').value.trim();
        const unidade = document.getElementById('unidade-insumo').value;
        const quantidadeTotal = this.parseCommaNumber(document.getElementById('quantidade-total').value);
        const valorPago = this.parseCommaNumber(document.getElementById('valor-pago').value);

        if (!nome || !quantidadeTotal || !valorPago) {
            this.showMessage('Por favor, preencha todos os campos!', 'error');
            return;
        }

        const insumo = {
            id: Date.now(),
            nome,
            unidade,
            quantidadeTotal,
            valorPago,
            custoPorUnidade: valorPago / quantidadeTotal,
            quantidadeRestante: quantidadeTotal
        };

        this.insumos.push(insumo);
        this.saveInsumos();
        this.renderInsumos();
        this.renderUsoInsumos();

        // Limpar formulário
        document.getElementById('form-insumo').reset();
        this.showMessage('Insumo adicionado com sucesso!', 'success');
    }

    handleCalcularProducao(e) {
        e.preventDefault();

        const nomeProduto = document.getElementById('nome-produto').value.trim();
        const quantidadeProduzida = parseInt(document.getElementById('quantidade-produzida').value);

        if (!nomeProduto || !quantidadeProduzida) {
            this.showMessage('Por favor, preencha o nome do produto e quantidade produzida!', 'error');
            return;
        }

        const insumosUsados = [];
        let custoTotal = 0;
        let temInsumoUsado = false;

                 // Coletar dados de uso dos insumos
         this.insumos.forEach(insumo => {
             const quantidadeUsada = this.parseCommaNumber(document.getElementById(`uso-${insumo.id}`)?.value || '0');
             const unidadeUsada = document.getElementById(`unidade-uso-${insumo.id}`)?.value || insumo.unidade;
             
             if (quantidadeUsada > 0) {
                 temInsumoUsado = true;
                 
                 // Converter quantidade para a unidade base do insumo
                 const quantidadeConvertida = this.converterUnidade(quantidadeUsada, unidadeUsada, insumo.unidade);
                 
                 if (quantidadeConvertida > insumo.quantidadeRestante) {
                     this.showMessage(`Quantidade insuficiente de ${insumo.nome}. Disponível: ${insumo.quantidadeRestante} ${this.formatarUnidade(insumo.quantidadeRestante, insumo.unidade)}`, 'error');
                     return;
                 }

                 const custoInsumo = quantidadeConvertida * insumo.custoPorUnidade;
                 custoTotal += custoInsumo;

                 insumosUsados.push({
                     nome: insumo.nome,
                     quantidadeUsada,
                     unidade: unidadeUsada,
                     custoPorUnidade: insumo.custoPorUnidade,
                     custoTotal: custoInsumo
                 });

                 // Atualizar quantidade restante
                 insumo.quantidadeRestante -= quantidadeConvertida;
             }
         });

        if (!temInsumoUsado) {
            this.showMessage('Por favor, informe a quantidade usada de pelo menos um insumo!', 'error');
            return;
        }

        const custoPorUnidade = custoTotal / quantidadeProduzida;

        // Salvar no histórico
        const producao = {
            id: Date.now(),
            data: new Date().toLocaleDateString('pt-BR'),
            nomeProduto,
            quantidadeProduzida,
            insumosUsados,
            custoTotal,
            custoPorUnidade
        };

        this.historico.unshift(producao); // Adicionar no início do array
        this.saveInsumos();
        this.saveHistorico();

        // Mostrar resultados
        this.mostrarResultados(producao);

        // Limpar formulário
        document.getElementById('form-producao').reset();
        this.renderUsoInsumos();
        this.renderInsumos();

        this.showMessage('Cálculo realizado com sucesso!', 'success');
    }

    mostrarResultados(producao) {
        const resultadoDiv = document.getElementById('resultado-calculo');
        const detalhesDiv = document.getElementById('detalhes-calculo');

        let detalhesHTML = `
            <div class="producao-card">
                <h4 class="text-lg font-bold text-gray-800 mb-3">${producao.nomeProduto}</h4>
                                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <div class="text-center">
                         <div class="text-2xl font-bold text-blue-600">${producao.quantidadeProduzida}</div>
                         <div class="text-sm text-gray-600">${this.formatarUnidade(producao.quantidadeProduzida, 'unidades')} Produzidas</div>
                     </div>
                     <div class="text-center">
                         <div class="text-2xl font-bold text-green-600">R$ ${this.formatarPreco(producao.custoTotal)}</div>
                         <div class="text-sm text-gray-600">Custo Total</div>
                     </div>
                     <div class="text-center">
                         <div class="text-2xl font-bold text-purple-600">R$ ${this.formatarPreco(producao.custoPorUnidade)}</div>
                         <div class="text-sm text-gray-600">Custo por Unidade</div>
                     </div>
                 </div>
                
                <h5 class="font-semibold text-gray-700 mb-2">Detalhamento dos Insumos:</h5>
                <div class="space-y-2">
        `;

        producao.insumosUsados.forEach(insumo => {
            detalhesHTML += `
                <div class="flex justify-between items-center bg-white rounded-lg p-3 border">
                    <div>
                        <span class="font-medium">${insumo.nome}</span>
                        <span class="text-gray-600 text-sm ml-2">${insumo.quantidadeUsada} ${insumo.unidade}</span>
                    </div>
                                         <div class="text-right">
                         <div class="font-bold text-green-600">R$ ${this.formatarPreco(insumo.custoTotal)}</div>
                         <div class="text-xs text-gray-500">R$ ${this.formatarPreco(insumo.custoPorUnidade, 4)}/${insumo.unidade}</div>
                     </div>
                </div>
            `;
        });

        detalhesHTML += `
                </div>
            </div>
        `;

        detalhesDiv.innerHTML = detalhesHTML;
        resultadoDiv.classList.remove('hidden');

        // Scroll suave para o resultado
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    renderInsumos() {
        const listaInsumos = document.getElementById('lista-insumos');
        
        if (this.insumos.length === 0) {
            listaInsumos.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">📦</div>
                    <p>Nenhum insumo cadastrado ainda.</p>
                    <p class="text-sm">Adicione seus primeiros insumos acima!</p>
                </div>
            `;
            return;
        }

        const insumosHTML = this.insumos.map(insumo => `
            <div class="insumo-card">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-gray-800">${insumo.nome}</h4>
                    <button onclick="app.removerInsumo(${insumo.id})" 
                            class="text-red-500 hover:text-red-700 text-sm font-medium"
                            title="Remover insumo">
                        🗑️
                    </button>
                </div>
                                 <div class="grid grid-cols-2 gap-4 text-sm">
                     <div>
                         <span class="text-gray-600">Total:</span>
                         <span class="font-medium ml-1">${insumo.quantidadeTotal} ${this.formatarUnidade(insumo.quantidadeTotal, insumo.unidade)}</span>
                     </div>
                     <div>
                         <span class="text-gray-600">Restante:</span>
                         <span class="font-medium ml-1 ${insumo.quantidadeRestante <= 0 ? 'text-red-500' : ''}">${insumo.quantidadeRestante} ${this.formatarUnidade(insumo.quantidadeRestante, insumo.unidade)}</span>
                     </div>
                     <div>
                         <span class="text-gray-600">Valor pago:</span>
                         <span class="font-medium ml-1">R$ ${this.formatarPreco(insumo.valorPago)}</span>
                     </div>
                     <div>
                         <span class="text-gray-600">Custo/${this.formatarUnidade(1, insumo.unidade)}:</span>
                         <span class="font-medium ml-1">R$ ${this.formatarPreco(insumo.custoPorUnidade, 4)}</span>
                     </div>
                 </div>
                ${insumo.quantidadeRestante <= 0 ? 
                    '<div class="mt-2 text-red-500 text-sm font-medium">⚠️ Estoque esgotado</div>' : 
                    ''
                }
            </div>
        `).join('');

        listaInsumos.innerHTML = insumosHTML;
    }

    renderUsoInsumos() {
        const listaUsoInsumos = document.getElementById('lista-uso-insumos');
        
        if (this.insumos.length === 0) {
            listaUsoInsumos.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <p>Cadastre insumos primeiro para começar uma produção.</p>
                </div>
            `;
            return;
        }

        const insumosDisponiveis = this.insumos.filter(insumo => insumo.quantidadeRestante > 0);
        
        if (insumosDisponiveis.length === 0) {
            listaUsoInsumos.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <p>Nenhum insumo disponível no estoque.</p>
                    <p class="text-sm">Cadastre mais insumos para continuar.</p>
                </div>
            `;
            return;
        }

        const usoHTML = insumosDisponiveis.map(insumo => `
            <div class="bg-gray-50 rounded-lg p-4 border">
                                 <div class="flex justify-between items-center mb-2">
                     <h5 class="font-medium text-gray-800">${insumo.nome}</h5>
                     <span class="text-sm text-gray-600">${insumo.quantidadeRestante} ${this.formatarUnidade(insumo.quantidadeRestante, insumo.unidade)} disponível</span>
                 </div>
                 <div class="flex items-center space-x-2">
                     <label class="text-sm text-gray-600">Quantidade usada:</label>
                     <input type="text" 
                            id="uso-${insumo.id}" 
                            pattern="[0-9]+([,.]?[0-9]*)*"
                            class="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="0">
                     <select id="unidade-uso-${insumo.id}" class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                         <option value="gramas" ${insumo.unidade === 'gramas' ? 'selected' : ''}>g</option>
                         <option value="quilos" ${insumo.unidade === 'quilos' ? 'selected' : ''}>kg</option>
                         <option value="unidades" ${insumo.unidade === 'unidades' ? 'selected' : ''}>un</option>
                         <option value="mililitros" ${insumo.unidade === 'mililitros' ? 'selected' : ''}>ml</option>
                         <option value="litros" ${insumo.unidade === 'litros' ? 'selected' : ''}>L</option>
                     </select>
                 </div>
                 <div class="text-xs text-gray-500 mt-1">
                     Custo: R$ ${this.formatarPreco(insumo.custoPorUnidade, 4)} por ${this.formatarUnidade(1, insumo.unidade)}
                 </div>
            </div>
        `).join('');

                 listaUsoInsumos.innerHTML = usoHTML;
    }

    renderHistorico() {
        const listaHistorico = document.getElementById('lista-historico');
        
        if (this.historico.length === 0) {
            listaHistorico.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-2">📊</div>
                    <p>Nenhuma produção registrada ainda.</p>
                    <p class="text-sm">Seus cálculos aparecerão aqui!</p>
                </div>
            `;
            return;
        }

        const historicoHTML = this.historico.map(producao => `
            <div class="producao-card">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-bold text-gray-800">${producao.nomeProduto}</h4>
                        <p class="text-sm text-gray-600">${producao.data}</p>
                    </div>
                    <button onclick="app.removerProducao(${producao.id})" 
                            class="text-red-500 hover:text-red-700 text-sm"
                            title="Remover produção">
                        🗑️
                    </button>
                </div>
                
                                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                     <div class="text-center">
                         <div class="text-lg font-bold text-blue-600">${producao.quantidadeProduzida}</div>
                         <div class="text-xs text-gray-600">${this.formatarUnidade(producao.quantidadeProduzida, 'unidades')}</div>
                     </div>
                     <div class="text-center">
                         <div class="text-lg font-bold text-green-600">R$ ${this.formatarPreco(producao.custoTotal)}</div>
                         <div class="text-xs text-gray-600">Custo Total</div>
                     </div>
                     <div class="text-center">
                         <div class="text-lg font-bold text-purple-600">R$ ${this.formatarPreco(producao.custoPorUnidade)}</div>
                         <div class="text-xs text-gray-600">Por Unidade</div>
                     </div>
                 </div>
                
                <details class="text-sm">
                    <summary class="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                        Ver detalhes dos insumos
                    </summary>
                    <div class="mt-2 space-y-1">
                                                 ${producao.insumosUsados.map(insumo => `
                             <div class="flex justify-between bg-white rounded p-2 border">
                                 <span>${insumo.nome} - ${insumo.quantidadeUsada} ${this.formatarUnidade(insumo.quantidadeUsada, insumo.unidade)}</span>
                                 <span class="font-medium">R$ ${this.formatarPreco(insumo.custoTotal)}</span>
                             </div>
                         `).join('')}
                    </div>
                </details>
            </div>
        `).join('');

        listaHistorico.innerHTML = historicoHTML;
    }

    removerInsumo(id) {
        if (confirm('Tem certeza que deseja remover este insumo?')) {
            this.insumos = this.insumos.filter(insumo => insumo.id !== id);
            this.saveInsumos();
            this.renderInsumos();
            this.renderUsoInsumos();
            this.showMessage('Insumo removido com sucesso!', 'success');
        }
    }

    removerProducao(id) {
        if (confirm('Tem certeza que deseja remover esta produção do histórico?')) {
            this.historico = this.historico.filter(producao => producao.id !== id);
            this.saveHistorico();
            this.renderHistorico();
            this.showMessage('Produção removida do histórico!', 'success');
        }
    }

    limparHistorico() {
        if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
            this.historico = [];
            this.saveHistorico();
            this.renderHistorico();
            this.showMessage('Histórico limpo com sucesso!', 'success');
        }
    }

    showMessage(message, type = 'info') {
        // Remover mensagem anterior se existir
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        // Adicionar animação
        setTimeout(() => messageDiv.classList.add('success-animation'), 10);

        // Remover após 3 segundos
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    saveInsumos() {
        localStorage.setItem('licella_insumos', JSON.stringify(this.insumos));
    }

    saveHistorico() {
        localStorage.setItem('licella_historico', JSON.stringify(this.historico));
    }
}

// Inicializar aplicação quando a página carregar
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LicellaApp();
});
