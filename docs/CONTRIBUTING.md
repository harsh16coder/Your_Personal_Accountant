# 🤝 Contributing to Your Personal Accountant

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Any conduct that could be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Git
- Code editor (VS Code recommended)

### Fork and Clone

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/Your_Personal_Accountant.git
cd Your_Personal_Accountant

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/Your_Personal_Accountant.git
```

### Setup Development Environment

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies

# Frontend setup
cd frontend
npm install

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Run Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clear, self-documenting code
- Follow coding standards (see below)
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run all tests
npm test              # Frontend
python -m pytest      # Backend

# Run linters
npm run lint          # Frontend
flake8 .              # Backend
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add expense categorization feature"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## 💻 Coding Standards

### Python (Backend)

**Style Guide:** PEP 8

```python
# Good
def calculate_net_worth(assets, liabilities):
    """Calculate net worth from assets and liabilities.
    
    Args:
        assets (list): List of asset dictionaries
        liabilities (list): List of liability dictionaries
        
    Returns:
        float: Net worth value
    """
    total_assets = sum(asset['amount'] for asset in assets)
    total_liabilities = sum(liability['amount'] for liability in liabilities)
    return total_assets - total_liabilities

# Bad
def calc(a, l):
    return sum([x['amount'] for x in a]) - sum([y['amount'] for y in l])
```

**Key Principles:**

- Use descriptive variable names
- Add docstrings to functions
- Follow PEP 8 for formatting
- Keep functions small and focused
- Handle errors gracefully

**Linting:**

```bash
# Install development dependencies
pip install flake8 black isort

# Format code
black .
isort .

# Check style
flake8 .
```

### JavaScript/React (Frontend)

**Style Guide:** Airbnb JavaScript Style Guide

```javascript
// Good
const AssetCard = ({ asset, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    try {
      await updateAsset(asset.id, updatedData);
      onUpdate();
    } catch (error) {
      console.error('Failed to update asset:', error);
    }
  };
  
  return (
    <div className="asset-card">
      {/* Component JSX */}
    </div>
  );
};

// Bad
function card(a, u) {
  const [e, sE] = useState(false);
  return <div>{a.name}</div>;
}
```

**Key Principles:**

- Use functional components with hooks
- Prop-types or TypeScript for type checking
- Meaningful component and variable names
- Extract reusable logic into custom hooks
- Use const for constants, let for variables

**Linting:**

```bash
# Format code
npm run format

# Check style
npm run lint
```

### CSS/Tailwind

```html
<!-- Good: Semantic class names, consistent spacing -->
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-800">Asset Details</h2>
  <p className="text-gray-600">Description text</p>
</div>

<!-- Bad: Inconsistent, hard to maintain -->
<div className="flex gap-2 p-2" style="background: white">
  <h2 className="text-xl">Asset</h2>
</div>
```

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(chatbot): add expense categorization"

# Bug fix
git commit -m "fix(api): resolve payment calculation error"

# Documentation
git commit -m "docs(readme): update installation instructions"

# With body and footer
git commit -m "feat(dashboard): add net worth chart

Add interactive chart showing net worth over time.
Uses Recharts library for visualization.

Closes #123"
```

### Commit Message Guidelines

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to" not "moves cursor to")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant
- Provide context in the body for complex changes

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commits follow commit guidelines
- [ ] No merge conflicts with main branch

### PR Title Format

Follow commit message format:

```
feat(chatbot): add multi-language support
fix(api): correct timezone handling in date calculations
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing

## Related Issues
Closes #issue_number
```

### Review Process

1. **Automated Checks** - CI/CD runs tests and linters
2. **Code Review** - Maintainers review code
3. **Feedback** - Address review comments
4. **Approval** - Get approval from maintainer
5. **Merge** - Maintainer merges PR

### Review Timeline

- Initial review within 48 hours
- Follow-up reviews within 24 hours
- Inactive PRs may be closed after 30 days

---

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** - Your bug might already be reported
2. **Try latest version** - Bug might be fixed
3. **Gather information** - Steps to reproduce, screenshots, logs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 96, Firefox 95]
- Version: [e.g., 1.2.0]

**Additional context**
Any other relevant information
```

### Severity Levels

- **Critical**: App crashes, data loss
- **Major**: Core feature broken
- **Minor**: UI glitch, non-blocking bug
- **Trivial**: Cosmetic issue

---

## ✨ Feature Requests

### Before Requesting

1. **Check existing requests** - Feature might be planned
2. **Consider scope** - Should it be a core feature?
3. **Think about alternatives** - Can it be achieved differently?

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives considered**
Other solutions you've considered

**Additional context**
Mockups, examples, etc.

**Would you like to implement this feature?**
- [ ] Yes, I can implement this
- [ ] No, I need help
- [ ] I can help with testing
```

---

## 🎯 Good First Issues

New to the project? Look for issues labeled:

- `good first issue` - Perfect for beginners
- `help wanted` - We need contributors
- `documentation` - Docs improvements

---

## 💬 Communication

### Where to Ask Questions

- **GitHub Discussions** - General questions, ideas
- **GitHub Issues** - Bug reports, feature requests
- **Pull Request Comments** - Code-specific discussions

### Response Times

- Issues: Acknowledged within 48 hours
- Pull Requests: Initial review within 48 hours
- Questions: Response within 72 hours

---

## 🏆 Recognition

Contributors are recognized in:

- README contributors section
- Release notes
- GitHub contributors page

Significant contributions may earn you:

- Collaborator status
- Special mentions
- Feature naming rights

---

## 📚 Additional Resources

- [Project Documentation](docs/)
- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Development Setup](docs/GETTING_STARTED.md)

---

## 📞 Contact

Need help? Have questions?

- 📧 Email: your-email@example.com
- 💬 GitHub Discussions
- 🐛 GitHub Issues

---

**Thank you for contributing to Your Personal Accountant! 🎉**

Every contribution, no matter how small, makes a difference. We appreciate your time and effort!
