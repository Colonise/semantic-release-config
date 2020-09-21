import SemanticReleaseError from '@semantic-release/error';

const packageName = process.env.COLONISE_PACKAGE_NAME;

if (!packageName) {
    throw new SemanticReleaseError(
        'The package name must be provided.',
        'ENOPACKAGENAME',
        'Make sure to add the environment variable \'COLONISE_PACKAGE_NAME\' to the Travis CI build.'
    );
}

const packageNameLower = packageName.toLowerCase();

const parserOpts = {
    headerPattern: /^(\w*)(?:\(([\w$.\-* ]*)\))?: (.*)$/u,
    headerCorrespondence: [
        'type',
        'scope',
        'subject'
    ],
    referenceActions: [
        'close',
        'closes',
        'closed',
        'fix',
        'fixes',
        'fixed',
        'resolve',
        'resolves',
        'resolved'
    ],
    issuePrefixes: [
        '#'
    ],
    issuePrefixesCaseSensitive: false,
    noteKeywords: [
        'BREAKING CHANGE',
        'BREAKING CHANGES'
    ],
    fieldPattern: /^-(.*?)-$/u,
    revertPattern: /^Revert\s"([\s\S]*)"\s*This reverts commit (\w*)\./u,
    revertCorrespondence: [
        'header',
        'hash'
    ],
    warm: true
};

const writerOpts = {
    groupBy: 'type',
    commitsSort: [
        'subject',
        'scope'
    ],
    noteGroupsSort: [
        'title'
    ],
    notesSort: [
        'text'
    ],
    reverse: false,
    includeDetails: false,
    ignoreReverted: true,
    doFlush: true
};

const commitAnalyzer = [
    '@semantic-release/commit-analyzer',
    {
        parserOpts,
        releaseRules: [
            {
                type: 'deps',
                release: 'patch'
            }
        ]
    }
];

const releaseNtesGenerator = [
    '@semantic-release/release-notes-generator',
    {
        parserOpts,
        writerOpts,
        host: 'https://github.com',
        linkCompare: true,
        linkReferences: true,
        commit: 'commit',
        issue: 'issues'
    }
];

const changelog = [
    '@semantic-release/changelog',
    {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: 'Changelog'
    }
];

const npm = [
    '@semantic-release/npm',
    {
        npmPublish: true,
        pkgRoot: './distribute',
        tarballDir: '.'
    }
];

const git = [
    '@semantic-release/git',
    {
        message: `chore(release): <%= nextRelease.version %> [skip ci]

<%= nextRelease.notes %>`,
        assets: [
            'package.json',
            'package-lock.json',
            'CHANGELOG.md'
        ]
    }
];

const github = [
    '@semantic-release/github',
    {
        assets: [
            {
                label: `Colonise ${packageName} <%= nextRelease.gitTag %> NPM package`,
                name: `colonise-${packageNameLower}-<%= nextRelease.gitTag %>.tgz`,
                path: `colonise-${packageNameLower}-*.tgz`
            },
            {
                label: `Colonise ${packageName} <%= nextRelease.gitTag %> distribution`,
                name: `colonise-${packageNameLower}-<%= nextRelease.gitTag %>.zip`,
                path: './build.zip'
            }
        ],
        successComment: `This <%= issue.pull_request ? 'pull request has been included in' : 'issue has been resolved in' %> **[release <%= nextRelease.gitTag %>](https://github.com/Colonise/${packageName}/releases/tag/<%= nextRelease.gitTag %>)**!

You can install the **[npm package](https://www.npmjs.com/package/@colonise/${packageNameLower})** for <%= nextRelease.gitTag %> using \`npm install @colonise/${packageNameLower}@<%= nextRelease.version %>\`

_Automatically generated by [semantic-release](https://github.com/semantic-release/semantic-release)._`,
        failComment: 'This release from branch <%= branch.name %> failed due to the following errors: <%= errors.map(error => \'\\n- \' + error.message) %>',
        failTitle: 'The automatic publishing of release <%= nextRelease.gitTag %> is failing.',
        labels: [
            'release'
        ],
        assignees: [
            'pathurs'
        ],
        releasedLabels: [
            'released<%= nextRelease.channel ? \' on @\' + nextRelease.channel : \'\' %>'
        ],
        addReleases: 'bottom'
    }
];

export const plugins = [
    commitAnalyzer,
    releaseNtesGenerator,
    changelog,
    npm,
    github,
    git
];
