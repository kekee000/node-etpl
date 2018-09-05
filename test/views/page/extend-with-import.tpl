{%@extend: ../extend%}

{%block: header%}
extend-with-import
{%/block%}

{%block: body%}
{%@import: import-with-import%}
{%@import: ../import-target%}
{%/block%}

