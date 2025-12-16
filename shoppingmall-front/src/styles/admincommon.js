import styled from 'styled-components';
import { Link } from 'react-router-dom';

// ------------------------------
// 폼(Form) 요소
// ------------------------------

export const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.large};
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.small};
  font-weight: 600;
  font-size: ${props => props.theme.fontSizes.medium};
`;

// Input, Textarea, Select의 공통 스타일
const CommonInputStyle = `
  width: 100%;
  padding: 12px;
  font-size: ${props => props.theme.fontSizes.large};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  box-sizing: border-box;
`;

export const Input = styled.input`
  ${CommonInputStyle}
`;

export const Textarea = styled.textarea`
  ${CommonInputStyle}
  min-height: 100px;
  resize: vertical;
`;

export const Select = styled.select`
  ${CommonInputStyle}
`;

// ------------------------------
// 버튼(Button)
// ------------------------------

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.medium};
  margin-top: ${props => props.theme.spacing.xlarge};
`;

// <button> 태그용
export const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  cursor: pointer;
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: 600;
  transition: background 0.2s;

  background: ${props => (props.$primary ? props.theme.colors.primary : '#eee')};
  color: ${props => (props.$primary ? props.theme.colors.surface : props.theme.colors.text)};

  &:hover {
    opacity: 0.8;
  }
`;

// <Link> 태그용
export const ButtonLink = styled(Link)`
  display: inline-block;
  padding: 12px 20px;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;

  background: ${props => (props.$primary ? props.theme.colors.primary : '#eee')};
  color: ${props => (props.$primary ? props.theme.colors.surface : props.theme.colors.text)};

  &:hover {
    opacity: 0.8;
  }
`;

// ------------------------------
// 테이블(Table) - AdminProductList
// ------------------------------

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 900px;
`;

export const Th = styled.th`
  padding: 12px;
  border-bottom: 2px solid #eee;
  background: #f9f9f9;
  font-size: ${props => props.theme.fontSizes.medium};
  font-weight: 600;
  white-space: nowrap;
`;

export const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  font-size: ${props => props.theme.fontSizes.medium};
  white-space: nowrap;
`;

// ------------------------------
// 레이아웃(Layout) 및 카드
// ------------------------------

export const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.title};
  font-weight: bold;
  margin-bottom: ${props => props.theme.spacing.large};
`;

export const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.large};
  border-radius: ${props => props.theme.borderRadius.large};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

export const DashCard = styled(Card)`
  flex: 1;
`;

// ------------------------------
// 대시보드 (AdminHome, AdminProductList 공통)
// ------------------------------

export const Dashboard = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.large}; // 20px
  margin-bottom: ${props => props.theme.spacing.large};
`;

export const DashCardTitle = styled.p`
  font-size: ${props => props.theme.fontSizes.medium};
  color: ${props => props.theme.colors.textLight};
  margin-bottom: ${props => props.theme.spacing.medium};
  margin-top: 0;
`;

export const DashCardValue = styled.p`
  font-size: ${props => props.theme.fontSizes.titleLarge};
  font-weight: bold;
  margin: 0;
`;

export const DashCardTrend = styled.p`
  font-size: ${props => props.theme.fontSizes.medium};
  margin-top: ${props => props.theme.spacing.small};
  margin-bottom: 0;
  
  color: ${props => (props.$up ? props.theme.colors.success : props.theme.colors.danger)};
`;

// ------------------------------
// 컨텐츠 헤더 (AdminProductList 등)
// ------------------------------

export const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.large};
`;

export const ContentTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.xlarge}; 
  font-weight: bold;
  margin: 0;
`;