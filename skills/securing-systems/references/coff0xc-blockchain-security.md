---
name: coff0xc-blockchain-security
description: 区块链、智能合约、DeFi、Web3、跨链、代币和多链安全审计。用于授权合约审计准备、风险梳理、测试覆盖和修复验证。
---

# Coff0xc · 区块链与智能合约安全

## 触发

Solidity、EVM、Solana、Cosmos、Substrate、Cairo/StarkNet、TON、Algorand、DeFi、AMM、oracle、bridge、token、NFT、智能合约审计、Foundry、Hardhat、Slither、链上资金逻辑、价格来源、资产流转、合约权限、测试覆盖。

## 边界

- 只审计自有或授权合约、测试网、fork、本地环境和公开代码。
- 不提供盗取资金、操纵市场、绕过授权或攻击第三方协议的执行步骤。
- 主网交易、权限变更、升级、暂停、提款等动作前必须确认。

## 能力矩阵

| 能力域 | 覆盖 | 要点 |
| --- | --- | --- |
| EVM/Solidity | access control、reentrancy、oracle、upgrade、storage | Foundry/Hardhat/Slither |
| Solana | PDA、CPI、signer、ownership、account validation | 账户边界 |
| Cosmos/CosmWasm | message handlers、IBC、state transition、bank module | 链停和资金风险 |
| Substrate | origin、weights、panic、storage migration | runtime 风险 |
| Cairo/StarkNet | felt、L1/L2 messaging、address conversion | 类型和消息边界 |
| TON/Algorand | Jetton、forward amount、rekey、fee validation | 链特性 |
| DeFi | AMM、lending、liquidation、oracle、MEV、bridge | 资金流和不变量 |
| Token/NFT | ERC20/721/1155、permit、royalty、mint/burn | 标准一致性 |

## 工作流

1. 范围确认：合约、链、commit、部署地址、权限、测试命令。
2. 架构梳理：资产流、角色、状态机、外部依赖、预言机、升级路径。
3. 风险分析：访问控制、经济不变量、重入、精度、前置条件、回滚。
4. 工具扫描：Slither、Foundry fuzz/invariant、chain-specific scanner。
5. 手工验证：每个发现给调用路径、状态条件、影响和修复。
6. 复测报告：测试覆盖、残余风险、部署/升级注意。

## 验证清单

- 资产流和权限图清楚。
- 关键不变量有测试或人工证明。
- oracle/bridge/upgrade 风险单独评估。
- 修复后跑单测、fuzz、invariant 或静态扫描。
- 报告区分链上事实、代码事实和推断。

## 反模式

- 只跑 Slither 就下结论。
- 忽略经济攻击和业务不变量。
- 未确认链/版本/部署地址就评估影响。
- 输出可用于攻击主网协议的步骤。
