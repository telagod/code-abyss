# PERSONAL_SKILL_SYSTEM README

## 1. 鏈疆鏀瑰姩鎬昏锛堜腑鑻卞弻璇Е鍙戣ˉ鍏級

鏈疆宸插皢 `PERSONAL_SKILL_SYSTEM` 涓墍鏈変細褰卞搷瑙﹀彂鍒ゅ畾鐨勫叧閿潰缁熶竴涓轰腑鑻卞弻璇細

1. `skills/**/SKILL.md`
   - `trigger-keywords`锛氫腑鑻卞弻璇?   - `negative-keywords`锛氫腑鑻卞弻璇紙闈炵┖椤癸級
   - `aliases`锛氫腑鑻卞弻璇?2. `templates/skill/**/SKILL.md`
   - 鍚屾涓嫳鍙岃妯℃澘瀛楁锛岄伩鍏嶆柊寤?skill 鍥為€€鍒板崟璇?3. `registry/route-map.generated.json`
   - `activation.trigger-keywords`锛氫腑鑻卞弻璇?   - `activation.negative-keywords`锛氫腑鑻卞弻璇紙闈炵┖椤癸級
   - `aliases`锛氭柊澧炲苟涓嫳鍙岃
4. `registry/route.schema.json`
   - 璺敱 schema 鏂板 `aliases` 瀛楁瀹氫箟
5. `skills/tools/lib/skill-system-routing.js`
   - 鍚敤 `alias-match` 鎵撳垎锛堟鍓嶅瓨鍦ㄨ瘎鍒嗛」浣嗘湭瀹為檯鍙備笌锛?   - 鍖归厤鏀逛负杈圭晫鍖归厤锛岄伩鍏?`sec` 璇懡涓?`security`銆乣verify-security` 琚姠鍗?6. `registry/route-fixtures.generated.json`
   - 鏂板涓枃涓?alias 瑙﹀彂鍥炲綊鐢ㄤ緥

---

## 2. 楠岃瘉缁撴灉

宸插畬鎴愪互涓嬮獙璇佸苟閫氳繃锛?
1. 鍙岃瑕嗙洊缁熻
   - `SKILL.md`锛歚trigger` 35/35 鍙岃
   - `SKILL.md`锛歚negative`锛堥潪绌猴級24/24 鍙岃
   - `SKILL.md`锛歚aliases`锛堥潪绌猴級35/35 鍙岃
   - `route-map`锛?9/29 route 鍚弻璇?`trigger` 涓庡弻璇?`aliases`
2. 璺敱鍥炲綊
   - `route-fixtures`锛?7/17 閫氳繃
3. 缁撴瀯鏍￠獙
   - `verify-skill-system`锛歚status=pass`

寤鸿澶嶉獙鍛戒护锛?
```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
```

---

## 3. 閮ㄧ讲鍒?`.claude/skills` 鐨勬纭柟寮?
缁撹锛?*涓嶈鎶婂灞?`personal-skill-system` 鏁村寘鍐嶅涓€灞傛斁杩涘幓**銆?
鎺ㄨ崘鐩綍褰㈡€侊紙Claude/OpenCode 鍏煎锛夛細

```text
~/.claude/skills/
  routers/
    sage/
      SKILL.md
      references/...
  domains/
    architecture/
      SKILL.md
      references/...
  workflows/
  tools/
  guards/
```

涓嶈浣跨敤杩欑棰濆宓屽褰㈡€侊細

```text
~/.claude/skills/personal-skill-system/skills/...
```

鍘熷洜锛?
1. 璇?bundle 鏂囨。鏄庣‘寤鸿 folder-capable host 澶嶅埗鈥滃畬鏁?skill 鐩綍鈥濓紝鑰屼笉鏄彧璐村崟鏂囦欢銆?2. 瑙﹀彂涓庤兘鍔涙繁搴︿緷璧?`references/` 涓?`scripts/` 鍗忓悓銆?
---

## 4. 璺?CLI 鍏煎鎬э紙浣犲叧蹇冪殑 OpenCode 绛夛級

缁撹锛堝綋鍓嶅彛寰勶級锛?
1. **Claude Code**锛氬彲璇?`~/.claude/skills/**/SKILL.md`锛屽吋瀹规湰浣撶郴銆?2. **OpenCode**锛氬彲璇?Claude-compatible skills 鐩綍缁撴瀯鏃跺彲澶嶇敤锛堜互鍏跺綋鍓嶅畼鏂规枃妗ｄ负鍑嗭級銆?3. **鍏朵粬 CLI**锛氳嫢鏀寔 Claude-style skills discovery锛坄<skill>/SKILL.md`锛夐€氬父鍙鐢紱鑻ヤ粎鏀寔 prompt-only 鎴栫鏈?schema锛屽垯闇€瑕侀€傞厤灞傘€?
娉ㄦ剰浜嬮」锛?
1. 鍏煎鏍稿績鏄洰褰曠粨鏋勪笌鏂囦欢濂戠害锛屼笉鏄€滄枃浠跺悕鐪嬭捣鏉ュ儚鈥濄€?2. 宸ュ叿绫?skill锛坄runtime: scripted`锛夐渶淇濈暀 `scripts/` 鎵嶈兘瀹屾暣鍙戞尌銆?3. 鑻ユ煇 CLI 涓嶆敮鎸佽剼鏈墽琛岋紝鍙€€鍖栦负 knowledge-only 浣跨敤銆?
---

## 5. 缁存姢寤鸿锛堝悗缁户缁紨杩涳級

1. 姣忔鏀瑰姩 `SKILL.md` 鍚庡悓姝ユ洿鏂?`route-map.generated.json`銆?2. 鏂板鎴栬皟鏁村叧閿瘝鍚庯紝琛ヤ竴鏉?fixture 鍥炲綊鏍蜂緥锛堜腑/鑻辫嚦灏戝悇涓€鏉★級銆?3. 鍙戝竷鍓嶅浐瀹氭墽琛岋細

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
```

4. 淇濇寔鈥滃叆鍙ｈ杽銆佸弬鑰冩繁鈥濓細
   - `SKILL.md` 淇濇寔瑙﹀彂涓庤亴璐ｆ竻鏅?   - 娣卞害绛栫暐鏀惧湪 `references/`

---

## 6. 2026-04-19 杩唬鏇存柊锛堝伐鍏烽摼涓庤兘鍔涜瘎绾э級

### 6.1 Tooling 涓?Gate 鏇存柊

宸插畬鎴愶細

1. `pre-commit-gate` / `pre-merge-gate` 闃绘柇绛栫暐璋冩暣  
   - 鏀逛负鍙樆鏂€滄湰娆?changed files 鍛戒腑鐨?warning鈥?   - 鏃㈡湁鍘嗗彶璐ㄩ噺鍊轰繚鐣欏湪 report锛屼笉鍐嶇洿鎺ラ樆鏂彁浜?鍚堝苟
2. `verify-change` Git 鍙楅檺鍥為€€閾? 
   - 鏂板 `--changed-files` 鍙傛暟锛堟敮鎸侀€楀彿/鍒嗗彿/鎹㈣涓?`@file`锛?   - 鏀寔鐜鍙橀噺锛歚PSS_CHANGED_FILES` / `CODEX_CHANGED_FILES` / `CHANGED_FILES`
   - 鍦ㄥ彈闄愮幆澧冧笅灏?`git` 瀛愯繘绋?`EPERM` 鏄惧紡鏍囪涓?`git-permission-denied`
3. 璺緞璇箟淇  
   - `changedFiles` 缁熶竴鎸?target scope 杈撳嚭涓虹浉瀵硅矾寰勶紝鍑忓皯 module/doc-sync 璇垽

寤鸿鍛戒护锛?
```bash
node personal-skill-system/skills/tools/verify-change/scripts/run.js --target personal-skill-system --mode working --changed-files "skills/tools/lib/runtime.js,docs/README.md" --json
node personal-skill-system/skills/guards/pre-commit-gate/scripts/run.js --target personal-skill-system --json
node personal-skill-system/skills/guards/pre-merge-gate/scripts/run.js --target personal-skill-system --json
```

### 6.2 Capability Ratings 鏇存柊

褰撳墠璇勫垎闈細

- `TOP-ready`: 74
- `strong-but-not-top`: 0
- `thin`: 0
- total: 74

璇存槑锛?
- 本轮已完成 `AI / Infrastructure / DevOps / Review / Development / Architecture / Security / Data / Orchestration` 的 TOP-ready 全覆盖
- 璇勭骇鏉ユ簮涓哄伐绋嬭瘎瀹″垽瀹氾紙鍐呭娣卞害 + 鍙墽琛岀害鏉?+ 杈撳嚭濂戠害锛夛紝涓嶆槸鑷姩鍖?benchmark 鍒嗘暟
