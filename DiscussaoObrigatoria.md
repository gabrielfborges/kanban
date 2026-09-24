## Discussão obrigatória:

### 1. Esse acoplamento é um problema real ou aceitável para o tamanho atual do projeto?

Acredito que no momento ele não seja um problema tão grande, porque o projeto ainda é pequeno, porém se o sistema crescer isso pode dificultar a manutenção.

### 2. Se cards precisasse virar um serviço separado no futuro, o que quebraria primeiro?

Primeiro quebraria a verificação da existência da coluna e do limite de WIP, porque o módulo cards depende do BoardRepository para realizar essas validações.

### 3.  Uma alternativa seria o Board "possuir" a lista de ids de cartões (em vez de CardController perguntar ao BoardRepository) — o que isso resolveria, e o que isso criaria de novo?

Reduziria boa parte da dependência entre o Controller e o Repository e deixaria a relação entre o quadro e os cartões mais organizada.