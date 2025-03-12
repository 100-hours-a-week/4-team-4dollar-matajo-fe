# Git Ground Rules

팀원 모두가 지켜야 할 Git 협업 규칙입니다. Git Flow branching strategy를 기반으로 합니다.

## 기본 규칙

1. 절대로 `main`, `develop` branch에서 '직접' 수정을 하지 않는다.
2. 앱이 정상적으로 실행되지 않는 브랜치는 push, merge하지 않는다.
3. PR에 다른 사람들이 `approve` 하기 전까지 merge를 하지 않는다.
4. 팀원이 담당한 부분을 수정해야 하는 경우 변경사항을 사전에 전달한다.
5. merge된 브랜치는 삭제한다.

## 브랜치 네이밍 규칙
- feat : 새로운 기능 추가, 기존의 기능을 요구 사항에 맞추어 수정 커밋
- fix : 기능에 대한 버그 수정 커밋
- build : 빌드 관련 수정 / 모듈 설치 또는 삭제에 대한 커밋
- chore : 패키지 매니저 수정, 그 외 기타 수정 ex) .gitignore
- ci : CI 관련 설정 수정
- docs : 문서(주석) 수정
- style : 코드 스타일, 포맷팅에 대한 수정
- refactor : 기능의 변화가 아닌 코드 리팩터링 ex) 변수 이름 변경
- test : 테스트 코드 추가/수정
- release : 버전 릴리즈

예시: `feature/login-page`, `fix/navigation-error`

## 커밋 메시지 규칙

커밋 메시지는 다음 형식을 따릅니다:
```
<type>: <description>

[optional body]

[optional footer]
```

유형(type)은 다음 중 하나를 사용합니다:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 형식 변경 (기능 변경 없음)
- `refactor`: 리팩토링 코드
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 또는 도구 변경- 
- `!BREAKING CHANGE:` 커다란 API변경의 경우
- `!HOTFIX:` 급하게 치명적인 버그를 고쳐야 하는 경우

예시: `feat: 로그인 페이지 UI 구현`, `fix: 네비게이션 오류 수정`

## 작업 흐름

1. `develop` 브랜치에서 새 브랜치를 생성합니다.
2. 작업을 완료하고 커밋합니다.
3. `develop` 브랜치로 Pull Request를 생성합니다.
4. 코드 리뷰를 받고 승인을 받습니다.
5. `develop` 브랜치에 머지합니다.
6. 머지 후 작업 브랜치를 삭제합니다.
