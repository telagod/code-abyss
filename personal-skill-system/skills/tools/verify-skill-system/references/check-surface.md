# Check Surface

This tool validates the skill system itself rather than ordinary product code.

## Structural checks

- expected top-level directories exist
- `skills/**/SKILL.md` files are discoverable
- generated registry files exist and parse

## Skill contract checks

- required frontmatter fields exist
- skill `kind` matches directory layer
- skill names are unique
- user-invocable skills have route coverage

## Link and portability checks

- referenced files mentioned in `SKILL.md` exist
- scripted tools and guards expose `scripts/run.js`
- generated metadata does not reference missing skills

## What this tool does not prove

- that every route choice is semantically perfect
- that every reference contains optimal advice
- that host import into a real runtime has already succeeded

It proves structural integrity, not ultimate product taste.
