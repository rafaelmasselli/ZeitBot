# Logging System Upgrade

## O Que Foi Implementado

Sistema de logging estruturado com tracking de sessão, contexto e metadados para melhor rastreamento de erros e análise de logs.

## Principais Mudanças

### 1. Interface de Logger Expandida

**Antes:**
```typescript
interface ILogger {
  info(message: string): void;
  error(message: string): void;
  // ...
}
```

**Depois:**
```typescript
interface LogContext {
  sessionId?: string;
  userId?: string;
  phoneNumber?: string;
  module?: string;
  component?: string;
  action?: string;
  requestId?: string;
  newsId?: string;
  subscriberId?: string;
  [key: string]: any;
}

interface ILogger {
  info(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  setDefaultContext(context: LogContext): void;
  clearDefaultContext(): void;
}
```

### 2. Metadados Automáticos

Cada log agora inclui automaticamente:
- **logId**: UUID único para cada entrada
- **timestamp**: Data/hora formatada
- **level**: Nível do log
- **message**: Mensagem principal
- **pid**: Process ID
- **hostname**: Nome do servidor
- Qualquer contexto customizado fornecido

### 3. Logs Estruturados

**Antes:**
```typescript
this.logger.info(`Sent 5 recommendations to 5511999999999`);
```

**Depois:**
```typescript
this.logger.info("Recommendations sent successfully", {
  sessionId: "abc-123",
  phoneNumber: "5511999999999",
  subscriberId: "sub-456",
  module: "ai",
  component: "SendAIRecommendationsUseCase",
  action: "sendMessage",
  recommendationsCount: 5,
  messageLength: 450,
});
```

### 4. Tracking de Sessão

Cada operação agora pode ter um `sessionId` e/ou `executionId` único para rastrear todo o fluxo:

```typescript
const executionId = randomUUID();

// Início
this.logger.info("Job started", { executionId, action: "start" });

// Durante
this.logger.info("Processing user", { executionId, sessionId, userId });

// Fim
this.logger.info("Job completed", { executionId, action: "complete" });
```

### 5. Contexto Padrão por Serviço

```typescript
export class MyService {
  constructor(@inject("ILogger") private logger: ILogger) {
    this.logger.setDefaultContext({
      module: "ai",
      component: "MyService",
    });
  }
  
  execute() {
    // Automaticamente inclui module e component
    this.logger.info("Processing", { userId: "123" });
  }
}
```

## Formato dos Logs

### Console (desenvolvimento)
```
2025-12-30 14:30:15 [info]: Recommendations sent successfully {"sessionId":"abc-123","phoneNumber":"5511999999999","module":"ai","component":"SendAIRecommendationsUseCase","action":"sendMessage","logId":"...","pid":12345,"hostname":"server-01"}
```

### Arquivo JSON (produção)
```json
{
  "timestamp": "2025-12-30 14:30:15",
  "level": "info",
  "message": "Recommendations sent successfully",
  "sessionId": "abc-123",
  "phoneNumber": "5511999999999",
  "subscriberId": "sub-456",
  "module": "ai",
  "component": "SendAIRecommendationsUseCase",
  "action": "sendMessage",
  "recommendationsCount": 5,
  "messageLength": 450,
  "logId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "pid": 12345,
  "hostname": "server-01"
}
```

## Como Buscar Logs

### Por Usuário
```bash
jq 'select(.phoneNumber == "5511999999999")' logs/combined.log
```

### Por Sessão
```bash
jq 'select(.sessionId == "abc-123")' logs/combined.log
```

### Por Módulo
```bash
jq 'select(.module == "ai")' logs/combined.log
```

### Por Componente
```bash
jq 'select(.component == "SendAIRecommendationsUseCase")' logs/error.log
```

### Rastrear Fluxo Completo
```bash
# Todos os logs de uma execução
jq 'select(.executionId == "xyz-789")' logs/combined.log

# Timeline visual
jq 'select(.executionId == "xyz-789") | [.timestamp, .action, .message] | @tsv' logs/combined.log
```

## Arquivos Atualizados

### Core
- ✅ `src/shared/logger/logger.interface.ts` - Interface expandida
- ✅ `src/shared/logger/winston.logger.ts` - Implementação com contexto
- ✅ `shared/logger/logger.interface.ts` - Interface (duplicada)
- ✅ `shared/logger/winston.logger.ts` - Implementação (duplicada)

### Tests
- ✅ `src/__tests__/mocks/logger.mock.ts` - Mock atualizado

### Examples
- ✅ `src/shared/logger/logger.examples.ts` - 8 exemplos práticos

### Documentation
- ✅ `docs/LOGS.md` - Documentação completa atualizada
- ✅ `docs/SETUP.md` - Seção de logs adicionada

### Real Implementation
- ✅ `src/modules/whatsapp/use-cases/send-ai-recommendations.use-case.ts` - Exemplo prático implementado

## Benefícios

1. **Rastreabilidade**: Acompanhe todo o fluxo de uma operação via `sessionId` ou `executionId`
2. **Debugging**: Identifique rapidamente onde e quando erros ocorrem
3. **Análise**: Gere métricas e relatórios baseados em logs estruturados
4. **Performance**: Identifique gargalos com timestamps e duração
5. **User Experience**: Rastreie a jornada completa do usuário
6. **Monitoring**: Crie alertas baseados em padrões específicos

## Próximos Passos

### Para Desenvolvedores

1. **Migrar código existente**: Adicione contexto aos logs atuais
2. **Adicionar tracking**: Use `randomUUID()` para gerar IDs de sessão
3. **Definir padrões**: Estabeleça convenções para módulos e componentes
4. **Revisar exemplos**: Veja `logger.examples.ts` para inspiração

### Para Operações

1. **Configure alertas**: Monitore logs de erro em tempo real
2. **Crie dashboards**: Visualize métricas de uso e performance
3. **Automatize análises**: Scripts para detectar padrões anômalos
4. **Retenção**: Configure política de rotação e backup de logs

## Compatibilidade

✅ **Backward compatible**: Código existente continua funcionando:
```typescript
this.logger.info("Old style log"); // ✅ Funciona
this.logger.info("New style", { userId: "123" }); // ✅ Funciona
```

## Variável de Ambiente

```bash
# Ajustar nível de log
LOG_LEVEL=debug  # debug | info | warn | error
```

