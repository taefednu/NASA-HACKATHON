# Contributing to NASA Weather Probability Prediction System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs
1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Python version, etc.)
   - Screenshots if applicable

### Suggesting Features
1. **Open an issue** with the label `enhancement`
2. Describe:
   - The problem your feature would solve
   - How it would work
   - Why it's valuable

### Pull Requests

#### Before You Start
1. **Fork the repository**
2. **Create a new branch** from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Set up your environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

#### While Developing
1. **Write clean code** following Python PEP 8 style guide
2. **Add type annotations** (Python 3.11+)
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run tests** before submitting:
   ```bash
   pytest tests/ -v
   ```

#### Submitting
1. **Commit your changes**:
   ```bash
   git commit -m "feat: add new feature X"
   ```
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Adding tests
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**:
   - Clear title and description
   - Link to related issues
   - Screenshots/examples if applicable
   - Wait for review

## 📝 Code Style

### Python
- **PEP 8** style guide
- **Type annotations** for function parameters and returns
- **Docstrings** for public functions/classes (Google style)
- **Maximum line length**: 100 characters
- **Imports**: Organized by standard lib, third-party, local

Example:
```python
def analyze_weather(latitude: float, longitude: float, date: str) -> Dict[str, Any]:
    """
    Analyze weather probabilities for a given location and date.
    
    Args:
        latitude: Latitude in decimal degrees (-90 to 90)
        longitude: Longitude in decimal degrees (-180 to 180)
        date: Date in YYYY-MM-DD format
    
    Returns:
        Dictionary containing probabilities, statistics, and metadata
    
    Raises:
        ValueError: If coordinates are invalid
    """
    # Implementation
    pass
```

## 🧪 Testing

- Write unit tests for new features
- Aim for >80% code coverage
- Run tests locally before pushing:
  ```bash
  pytest tests/ -v --cov=weather_analysis
  ```

## 📚 Documentation

- Update README.md for major features
- Update docs/API.md for API changes
- Add code comments for complex logic
- Include examples in docstrings

## 🌳 Branch Strategy

- `main`: Stable production code
- `develop`: Development branch (merge PRs here)
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Open an issue with the label `question` or contact the maintainers.

## 🙏 Thank You!

Every contribution helps make this project better! 🎉
