# Interactive Node

O node **Interactive** permite criar elementos interativos diretamente na interface do n8n editor, capturando a interação do usuário e transformando-a em dados utilizáveis no workflow.

## Funcionalidades

### Tipos de Elementos Interativos

1. **Button Click** - Botão clicável que executa ações
2. **Text Input** - Campo de texto para entrada de dados
3. **Number Input** - Campo numérico com controles
4. **Dropdown Selection** - Lista suspensa com opções
5. **Checkbox** - Caixa de seleção verdadeiro/falso
6. **Date Picker** - Seletor de data e hora
7. **Color Picker** - Seletor de cores

### Dados de Saída

O node produz um objeto `interactive` com:
- Tipo do elemento
- Valor/estado atual
- Metadados opcionais (timestamp, execução, etc.)
- Dados processados específicos do tipo

## Exemplos de Uso

### 1. Botão para Gerar Timestamp
```json
{
  "interactive": {
    "type": "button",
    "label": "Gerar Timestamp",
    "buttonText": "Clique Aqui",
    "action": "timestamp",
    "result": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. Input de Texto com Análise
```json
{
  "interactive": {
    "type": "textInput",
    "label": "Digite uma mensagem",
    "value": "Hello World",
    "length": 11,
    "wordCount": 2
  }
}
```

### 3. Dropdown com Seleção
```json
{
  "interactive": {
    "type": "dropdown",
    "label": "Escolha uma opção",
    "selectedValue": "opt2",
    "selectedOptionDetails": {
      "name": "Option 2",
      "value": "opt2"
    }
  }
}
```

### 4. Color Picker com RGB
```json
{
  "interactive": {
    "type": "colorPicker",
    "label": "Escolha uma cor",
    "color": "#3498db",
    "rgb": {"r": 52, "g": 152, "b": 219},
    "brightness": 123
  }
}
```

## Como Usar no Workflow

### 1. No Editor n8n
- Adicione o node "Interactive" ao seu workflow
- Configure o tipo de elemento desejado
- Ajuste as propriedades diretamente na interface
- Execute o workflow para capturar as interações

### 2. Processando com Function (JavaScript)
```javascript
// Acessar dados da interação
const interactive = items[0].json.interactive;

// Diferentes tipos de processamento
if (interactive.type === 'button') {
  return [{ json: { 
    message: `Botão clicado: ${interactive.result}`,
    timestamp: new Date().toISOString()
  }}];
}

if (interactive.type === 'textInput') {
  return [{ json: {
    original: interactive.value,
    uppercase: interactive.value.toUpperCase(),
    words: interactive.wordCount
  }}];
}

if (interactive.type === 'colorPicker') {
  const { r, g, b } = interactive.rgb;
  return [{ json: {
    color: interactive.color,
    isDark: interactive.brightness < 128,
    complementary: `rgb(${255-r}, ${255-g}, ${255-b})`
  }}];
}
```

### 3. Processando com Python
```python
# Acessar dados da interação
interactive = items[0]['json']['interactive']

if interactive['type'] == 'numberInput':
    value = interactive['value']
    return [{
        'json': {
            'original': value,
            'squared': value ** 2,
            'factorial': math.factorial(abs(int(value))) if value >= 0 else None,
            'is_prime': is_prime(value)
        }
    }]

if interactive['type'] == 'datePicker':
    from datetime import datetime
    date_str = interactive['selectedDate']
    date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    
    return [{
        'json': {
            'formatted': date_obj.strftime('%d/%m/%Y'),
            'day_of_year': date_obj.timetuple().tm_yday,
            'week_number': date_obj.isocalendar()[1],
            'is_weekend': interactive['isWeekend']
        }
    }]
```

## Casos de Uso Práticos

1. **Interface de Configuração** - Criar dashboards interativos para configurar workflows
2. **Coleta de Dados** - Formulários dinâmicos que capturam entrada do usuário
3. **Controles de Execução** - Botões para disparar ações específicas
4. **Visualização de Estados** - Mostrar e controlar estados de sistema
5. **Prototipagem Rápida** - Testar interfaces antes de implementar nodes customizados

## Vantagens

- **Interação Direta**: Manipule dados diretamente na interface do n8n
- **Feedback Imediato**: Veja resultados das interações instantaneamente
- **Flexibilidade**: Múltiplos tipos de elementos em um só node
- **Metadados Ricos**: Informações contextuais sobre cada interação
- **Integração Fácil**: Dados estruturados prontos para outros nodes

O node Interactive transforma o editor n8n em uma interface mais dinâmica e interativa!