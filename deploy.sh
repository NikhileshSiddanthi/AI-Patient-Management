#!/bin/bash

# Patient Management System - Deployment Script
# This script automates the deployment process for both frontend and backend

set -e

echo "🏥 Patient Management System - Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install git first."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend .env file..."
        cp backend/.env.example backend/.env
        print_warning "Please edit backend/.env with your configuration"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        print_status "Creating frontend .env file..."
        cp frontend/.env.example frontend/.env
        print_warning "Please edit frontend/.env with your configuration"
    fi
    
    print_success "Environment files created!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed!"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    read -p "Do you want to setup the database now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Setting up PostgreSQL database..."
        
        read -p "Enter PostgreSQL username (default: postgres): " db_user
        db_user=${db_user:-postgres}
        
        read -p "Enter database name (default: pms_db): " db_name
        db_name=${db_name:-pms_db}
        
        # Create database
        createdb $db_name || print_warning "Database might already exist"
        
        # Run migrations
        print_status "Running database migrations..."
        cd backend
        PGPASSWORD=$db_password psql -U $db_user -d $db_name -f database/schema.sql
        npm run seed
        cd ..
        
        print_success "Database setup complete!"
    else
        print_warning "Database setup skipped. Please setup manually before starting the application."
    fi
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    npm run build
    
    if [ -d "dist" ]; then
        print_success "Frontend build completed! Files are in frontend/dist/"
    else
        print_error "Frontend build failed!"
        exit 1
    fi
    
    cd ..
}

# Start development servers
start_development() {
    print_status "Starting development servers..."
    
    # Start backend in background
    print_status "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 5
    
    # Start frontend in background
    print_status "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    print_success "Development servers started!"
    echo
    echo "Frontend: http://localhost:5173"
    echo "Backend: http://localhost:3001"
    echo
    echo "To stop servers, run: ./scripts/stop-dev.sh"
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    # Wait for user interrupt
    print_status "Press Ctrl+C to stop servers..."
    trap 'kill $BACKEND_PID $FRONTEND_PID; rm -f .backend.pid .frontend.pid; exit' INT
    wait
}

# Deploy to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    cd frontend
    vercel --prod
    cd ..
    
    print_success "Frontend deployed to Vercel!"
}

# Deploy to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    cd backend
    railway login
    railway init
    railway up
    cd ..
    
    print_success "Backend deployed to Railway!"
}

# Main menu
show_menu() {
    echo
    echo "What would you like to do?"
    echo "1) Setup development environment"
    echo "2) Start development servers"
    echo "3) Build frontend for production"
    echo "4) Deploy to Vercel (Frontend)"
    echo "5) Deploy to Railway (Backend)"
    echo "6) Setup database"
    echo "7) Run tests"
    echo "8) Show project info"
    echo "0) Exit"
    echo
}

# Show project information
show_info() {
    echo
    echo "🏥 Patient Management System"
    echo "==========================="
    echo
    echo "Technology Stack:"
    echo "  Frontend: React 18 + TypeScript + Vite"
    echo "  Backend: Node.js + TypeScript + Express"
    echo "  Database: PostgreSQL"
    echo "  Cache: Redis"
    echo "  Deployment: Vercel (Frontend) + Railway (Backend)"
    echo
    echo "Features:"
    echo "  ✅ Multi-role authentication"
    echo "  ✅ Patient management"
    echo "  ✅ AI-powered symptom checker"
    echo "  ✅ Appointment scheduling"
    echo "  ✅ Medical records"
    echo "  ✅ Real-time notifications"
    echo "  ✅ HIPAA compliance"
    echo
    echo "Test Accounts:"
    echo "  Admin: admin@pms.com / password123"
    echo "  Doctor: sarah.johnson@pms.com / password123"
    echo "  Nurse: emily.davis@pms.com / password123"
    echo "  Patient: john.smith@patient.com / password123"
    echo
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    print_status "Running backend tests..."
    cd backend
    npm test
    cd ..
    
    print_status "Running frontend tests..."
    cd frontend
    npm test -- --watchAll=false
    cd ..
    
    print_success "All tests completed!"
}

# Main execution
main() {
    check_requirements
    
    while true; do
        show_menu
        read -p "Enter your choice (0-8): " choice
        echo
        
        case $choice in
            1)
                setup_environment
                install_dependencies
                setup_database
                print_success "Development environment setup complete!"
                ;;
            2)
                install_dependencies
                start_development
                ;;
            3)
                install_dependencies
                build_frontend
                ;;
            4)
                build_frontend
                deploy_frontend
                ;;
            5)
                deploy_backend
                ;;
            6)
                setup_database
                ;;
            7)
                run_tests
                ;;
            8)
                show_info
                ;;
            0)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please try again."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Check if this script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi