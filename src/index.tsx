import * as React from 'react';

namespace DefaultClassName {
	export const PANEL =         'react-tiny-pager-panel'
	export const PAGE =          'react-tiny-pager-panel__page'
	export const PAGE_PREV =     'react-tiny-pager-panel__page-prev'
	export const PAGE_NEXT =     'react-tiny-pager-panel__page-next'
	export const PAGE_ELLIPSIS = 'react-tiny-pager-panel__page-ellipsis'
	export const PAGE_SELECTED = 'react-tiny-pager-panel__page-selected'
	export const PAGE_DISABLED = 'react-tiny-pager-panel__page-disabled'
}

interface TinyPagerProps extends React.Props<{}> {
		current: number;
		total: number;
		visible: number;
		fixed: number;
		title: {
			prev: string;
			next: string;
			ellipsis: string;
		}
		onChange(current: number);
		onMouseOver(current: number);
		onMouseOut(current: number);
}

const TinyPager: React.StatelessComponent<TinyPagerProps> = props => {

	function handlePrevPage() {
		handleChangePage(props.current - 1);
	}

	function handleNextPage() {
		handleChangePage(props.current + 1);
	}

	function handleChangePage(num: number) {
		props.onChange(num);
	}

	function handleMouseOver(num: number) {
		props.onMouseOver(num);
	}

	function handleMouseOut(num: number) {
		props.onMouseOut(num);
	}

	return (
		<ul className={DefaultClassName.PANEL}>
			<Page
				title={props.title.prev}
				classNames={[DefaultClassName.PAGE_PREV]}
				disabled={props.current === 1}
				onClick={handlePrevPage}
				/>
			{
				pagePropsList().map(pageProps => (
					<Page
						index={pageProps.index}
						title={pageProps.title}
						classNames={pageProps.classNames}
						onClick={pageProps.onPage}
					/>
				))
			}
			<Page
				title={props.title.next}
				classNames={[NEXT_CLASS]}
				disabled={props.current === props.total}
				onClick={handleNextPage}
				/>
	</ul>
	)
}

TinyPager.defaultProps.current = 1;
TinyPager.defaultProps.total = 20;
TinyPager.defaultProps.visible = 5;
TinyPager.defaultProps.fixed = 1;
TinyPager.defaultProps.title = {
	prev: 'prev',
	next: 'next',
	ellipsis: '...'
};

interface PageProps extends React.Props<{}> {
		index?: number;
		disabled?: boolean;
		selected?: boolean;
		title: string;
		classNames: string[];
		onClick(current: number);
		onMouseOver(current: number);
		onMouseOut(current: number);
}

const Page: React.StatelessComponent<PageProps> = (props) => (
	<li
		key={props.index}
		className={props.classNames.join(' ')}
		onClick={e => props.onClick(props.index)}
		onMouseOver={e => props.onMouseOver(props.index)}
		onMouseOut={e => props.onMouseOut(props.index)}
		>
		<span>{props.title}</span>
	</li>
)

Page.defaultProps.disabled = false;
Page.defaultProps.selected = false;

function getStartVisiblePage(currentPage: number, visiblePage: number): number {
	return currentPage - (isEven(visiblePage) ? visiblePage / 2 : Math.floor(visiblePage / 2));
}

function getEndVisiblePage(currentPage: number, visiblePage: number): number {
	return currentPage + (isEven(visiblePage) ? visiblePage / 2 - 1 : Math.floor(visiblePage / 2));
}

function isEven(num: number): boolean {
		return num % 2 === 0;
}

interface Range {
	from: number,
	to: number
}

function getVisiblePageRange(
	currentPage: number,
	visiblePage: number,
	fixedPage: number,
	totalPage: number
): Range {
	const startEllipsisPoint = fixedPage + 2;
	const endEllipsisPoint = totalPage - startEllipsisPoint;
	const startDisplayPage = getStartVisiblePage(currentPage, visiblePage);
	const endDisplayPage = getEndVisiblePage(currentPage, visiblePage);
	if (startDisplayPage <= startEllipsisPoint && endEllipsisPoint < endDisplayPage) {
			return {
				from: 1,
				to: totalPage
			}
	} else if (startDisplayPage < 1 && endDisplayPage < endEllipsisPoint) {
		return {
			from: 1,
			to: visiblePage
		}
	} else if (startDisplayPage <= startEllipsisPoint && endDisplayPage <= endEllipsisPoint) {
		return {
			from: 1,
			to: endDisplayPage
		}
	} else if (startEllipsisPoint < startDisplayPage && totalPage <= endDisplayPage) {
		return {
			from: totalPage - visiblePage + 1,
			to: totalPage
		}
	} else if (startEllipsisPoint < startDisplayPage && endEllipsisPoint < endDisplayPage) {
		return {
			from: startDisplayPage,
			to: totalPage
		}
	} else {
		return {
			from: startDisplayPage,
			to: endDisplayPage
		}
	}
}

// function* range(begin, end, interval = 1): Iterable<number> {
//   for (let i = begin; i <= end; i += interval) {
//     yield i;
//   }
// }

function range(begin, end, interval = 1): number[] {
	const r = [];
  for (let i = begin; i <= end; i += interval) {
    r.push(i);
  }
	return r;
}

function pagePropsList(
	currentPage: number,
	visiblePage: number,
	fixedPage: number,
	totalPage: number,
	onPageClick: (current: number) => void
): PageProps[] {
	const visiblePageRange = getVisiblePageRange(currentPage, visiblePage, fixedPage, totalPage);
	const pages: PageProps[] = [];
	if (visiblePageRange.from !== 1) {
		range(1, fixedPage).forEach(index => {
			pages.push({
				index,
				title: index,
				classNames: [DefaultClassName.PAGE],
				selected: index === currentPage,
				onPageClick
			});
		});
		pages.push({
			index,
			title: index,
			classNames: [DefaultClassName.PAGE_ELLIPSIS]
		});
	}
	range(visiblePageRange.from, visiblePageRange.to).forEach(index => {
		pages.push({
			index,
			title: index,
			classNames: [DefaultClassName.PAGE],
			selected: index === currentPage,
			onPageClick
		});
	});
	if (visiblePageRange.to !== totalPage) {
		pages.push({
			index,
			title: index,
			classNames: [DefaultClassName.PAGE_ELLIPSIS]
		});
		range(totalPage - fixedPage - 1, _totalPage).forEach(index => {
			pages.push({
				index,
				title: index,
				classNames: [DefaultClassName.PAGE],
				selected: index === currentPage,
				onPageClick
			});
		});
	}
	return pages;
}

export default TinyPager;